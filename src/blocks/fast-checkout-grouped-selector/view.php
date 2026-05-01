<?php
/**
 * Fast Checkout Grouped Selector — server-side registration.
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks\Fast_Checkout_Grouped_Selector;

use Newspack_Blocks\Fast_Checkout;

const BLOCK_SLUG = 'fast-checkout-grouped-selector';
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
 * Render the grouped selector SSR shell.
 *
 * @param array    $attrs   Block attributes (currently none defined).
 * @param string   $content Inner content (unused).
 * @param WP_Block $block   Block instance with context.
 * @return string Rendered HTML.
 */
function render_block( $attrs, $content, $block ) {
	if ( ! function_exists( 'wc_get_product' ) ) {
		return '';
	}

	$product_id = (int) ( $block->context['newspack-blocks/fastCheckoutProductId'] ?? 0 );
	if ( ! $product_id ) {
		return '';
	}
	$product = wc_get_product( $product_id );
	if ( ! $product || ! $product->is_type( 'grouped' ) ) {
		return '';
	}

	$child_ids = array_map( 'intval', $product->get_children() );
	if ( count( $child_ids ) < 2 ) {
		return '';
	}

	$current_child = (int) ( $block->context['newspack-blocks/fastCheckoutGroupedChild'] ?? 0 );
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if ( isset( $_GET[ Fast_Checkout::QP_GROUPED_CHILD ] ) ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$qp_raw = wp_unslash( $_GET[ Fast_Checkout::QP_GROUPED_CHILD ] );
		$qp     = (int) filter_var( $qp_raw, FILTER_SANITIZE_NUMBER_INT );
		if ( $qp > 0 && in_array( $qp, $child_ids, true ) ) {
			$current_child = $qp;
		}
	}
	if ( ! $current_child || ! in_array( $current_child, $child_ids, true ) ) {
		$current_child = $child_ids[0];
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'data-product-id'    => (string) $product_id,
			'data-current-child' => (string) $current_child,
		]
	);

	ob_start();
	?>
	<form <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<?php foreach ( $child_ids as $child_id ) : ?>
			<?php
			$child = wc_get_product( $child_id );
			if ( ! $child ) {
				continue;
			}
			$is_purchasable = $child->is_purchasable() && $child->is_in_stock();
			$input_id       = 'fc-grouped-child-' . $child_id;
			?>
			<label for="<?php echo esc_attr( $input_id ); ?>">
				<input
					id="<?php echo esc_attr( $input_id ); ?>"
					type="radio"
					name="fc_grouped_child"
					value="<?php echo esc_attr( (string) $child_id ); ?>"
					<?php checked( $current_child, $child_id ); ?>
					<?php disabled( ! $is_purchasable ); ?>
				/>
				<span><?php echo esc_html( $child->get_name() ); ?></span>
				<span class="price"><?php echo wp_kses_post( $child->get_price_html() ); ?></span>
			</label>
		<?php endforeach; ?>
		<p
			class="wp-block-newspack-blocks-fast-checkout-grouped-selector__notice"
			role="status"
			aria-live="polite"
			hidden
		></p>
	</form>
	<?php
	return (string) ob_get_clean();
}
