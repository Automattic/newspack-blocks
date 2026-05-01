<?php
/**
 * Fast Checkout NYP Input — server-side registration.
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks\Fast_Checkout_Nyp_Input;

use Newspack_Blocks\Fast_Checkout;

const BLOCK_SLUG = 'fast-checkout-nyp-input';
const BLOCK_NAME = 'newspack-blocks/' . BLOCK_SLUG;

/**
 * Register the block.
 */
function register_block() {
	register_block_type_from_metadata(
		__DIR__ . '/block.json',
		[
			'render_callback' => __NAMESPACE__ . '\\render_block',
		]
	);
}
add_action( 'init', __NAMESPACE__ . '\\register_block' );

/**
 * Enqueue the frontend view bundle when this block is present on the page.
 */
function enqueue_assets() {
	if ( is_admin() || ! is_singular() ) {
		return;
	}
	$post = get_post();
	if ( ! $post || ! has_block( BLOCK_NAME, $post ) ) {
		return;
	}
	\Newspack_Blocks::enqueue_view_assets( BLOCK_SLUG );
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_assets' );

/**
 * Render the NYP input SSR shell.
 *
 * @param array  $attrs   Block attributes.
 * @param string $content Inner content (unused).
 * @param object $block   Block instance with context.
 * @return string Rendered HTML.
 */
function render_block( $attrs, $content, $block ) {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return '';
	}
	if ( ! class_exists( '\WC_Name_Your_Price_Helpers' ) ) {
		return '';
	}

	$product_id = (int) ( $block->context['newspack-blocks/fastCheckoutProductId'] ?? 0 );
	if ( ! $product_id ) {
		return '';
	}
	$product = wc_get_product( $product_id );
	if ( ! $product ) {
		return '';
	}
	if ( ! \WC_Name_Your_Price_Helpers::is_nyp( $product_id ) ) {
		return '';
	}

	$min       = (float) \WC_Name_Your_Price_Helpers::get_minimum_price( $product_id );
	$max       = (float) \WC_Name_Your_Price_Helpers::get_maximum_price( $product_id );
	$suggested = (float) \WC_Name_Your_Price_Helpers::get_suggested_price( $product_id );

	$attr_price = $block->context['newspack-blocks/fastCheckoutNypPrice'] ?? '';
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$qp_price = '';
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET[ Fast_Checkout::QP_PRICE ] ) ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$qp_price = sanitize_text_field( wp_unslash( $_GET[ Fast_Checkout::QP_PRICE ] ) );
	}

	$current = $suggested;
	if ( $attr_price && is_numeric( $attr_price ) ) {
		$current = (float) $attr_price;
	}
	if ( $qp_price && is_numeric( $qp_price ) ) {
		$current = (float) $qp_price;
	}
	if ( $max > 0 ) {
		$current = min( $current, $max );
	}
	if ( $min > 0 ) {
		$current = max( $current, $min );
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'data-product-id' => (string) $product_id,
			'data-min'        => (string) $min,
			'data-max'        => (string) $max,
			'data-suggested'  => (string) $suggested,
		]
	);

	$min_price_html = $min ? wc_price( $min ) : '';
	$max_price_html = $max ? wc_price( $max ) : '';
	$suggested_html = $suggested ? wc_price( $suggested ) : '';

	$range_label = '';
	if ( $min && $max ) {
		$range_label = sprintf(
			/* translators: 1: min price, 2: max price, 3: suggested price */
			__( '%1$s – %2$s · suggested %3$s', 'newspack-blocks' ),
			$min_price_html,
			$max_price_html,
			$suggested_html
		);
	}

	$input_id = 'fc-nyp-input-' . $product_id;

	ob_start();
	?>
	<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<label for="<?php echo esc_attr( $input_id ); ?>">
			<?php esc_html_e( 'Set your price', 'newspack-blocks' ); ?>
		</label>
		<input
			id="<?php echo esc_attr( $input_id ); ?>"
			type="number"
			name="fc_nyp_price"
			step="0.01"
			<?php if ( $min ) : ?>
			min="<?php echo esc_attr( (string) $min ); ?>"
			<?php endif; ?>
			<?php if ( $max ) : ?>
			max="<?php echo esc_attr( (string) $max ); ?>"
			<?php endif; ?>
			value="<?php echo esc_attr( (string) $current ); ?>"
		/>
		<?php if ( $range_label ) : ?>
			<p class="wp-block-newspack-blocks-fast-checkout-nyp-input__hint">
				<?php echo wp_kses_post( $range_label ); ?>
			</p>
		<?php endif; ?>
		<p
			class="wp-block-newspack-blocks-fast-checkout-nyp-input__notice"
			role="status"
			aria-live="polite"
			hidden
		></p>
	</div>
	<?php
	return (string) ob_get_clean();
}
