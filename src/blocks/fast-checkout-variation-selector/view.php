<?php
/**
 * Fast Checkout Variation Selector — server-side registration.
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks\Fast_Checkout_Variation_Selector;

use Newspack_Blocks\Fast_Checkout;

const BLOCK_SLUG = 'fast-checkout-variation-selector';
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
 * Render the variation selector SSR shell.
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

	$product_id = $block->context['newspack-blocks/fastCheckoutProductId'] ?? 0;
	$product_id = (int) $product_id;
	if ( ! $product_id ) {
		return '';
	}

	$product = wc_get_product( $product_id );
	if ( ! $product || ! $product->is_type( 'variable' ) ) {
		return '';
	}

	$variations        = $product->get_available_variations();
	$current_variation = (int) ( $block->context['newspack-blocks/fastCheckoutVariationId'] ?? 0 );
	if ( count( $variations ) < 2 ) {
		return '';
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
	if ( isset( $_GET[ Fast_Checkout::QP_VARIATION ] ) ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$qp_raw = wp_unslash( $_GET[ Fast_Checkout::QP_VARIATION ] );
		$qp     = (int) filter_var( $qp_raw, FILTER_SANITIZE_NUMBER_INT );
		if ( $qp > 0 ) {
			$current_variation = $qp;
		}
	}

	$attributes = $product->get_variation_attributes();
	if ( empty( $attributes ) ) {
		return '';
	}

	$current_attrs = [];
	if ( $current_variation && function_exists( 'wc_get_product_variation_attributes' ) ) {
		$current_attrs = wc_get_product_variation_attributes( $current_variation );
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'data-product-id'        => (string) $product_id,
			'data-source-post'       => (string) get_the_ID(),
			'data-current-variation' => (string) $current_variation,
			'data-variations'        => wp_json_encode(
				array_map(
					function ( $v ) {
						return [
							'id'          => $v['variation_id'],
							'attributes'  => $v['attributes'],
							'is_in_stock' => $v['is_in_stock'],
						];
					},
					$variations
				)
			),
		]
	);

	// Map each (attribute_name, option_value) to is-available across in-stock variations.
	$option_availability = [];
	foreach ( $variations as $v ) {
		if ( empty( $v['is_in_stock'] ) ) {
			continue;
		}
		foreach ( $v['attributes'] as $key => $value ) {
			// $key is e.g. "attribute_color"; strip the prefix to match $attribute_name iteration below.
			$attr  = preg_replace( '/^attribute_/', '', $key );
			$value = sanitize_title( $value );
			$option_availability[ $attr ][ $value ] = true;
		}
	}

	ob_start();
	?>
	<form <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<?php foreach ( $attributes as $attribute_name => $options ) : ?>
			<?php
			$label      = wc_attribute_label( $attribute_name, $product );
			$field_name = 'attribute_' . sanitize_title( $attribute_name );
			$current    = $current_attrs[ $field_name ] ?? '';
			$current    = sanitize_title( $current );
			?>
			<fieldset>
				<legend><?php echo esc_html( $label ); ?></legend>
				<?php foreach ( $options as $option ) : ?>
					<?php
					$value          = sanitize_title( $option );
					$attr_key       = sanitize_title( $attribute_name );
					$is_available   = ! empty( $option_availability[ $attr_key ][ $value ] );
					?>
					<label>
						<input
							type="radio"
							name="<?php echo esc_attr( $field_name ); ?>"
							value="<?php echo esc_attr( $value ); ?>"
							<?php checked( $current, $value ); ?>
							<?php disabled( ! $is_available ); ?>
						/>
						<span><?php echo esc_html( $option ); ?></span>
						<?php if ( ! $is_available ) : ?>
							<span class="out-of-stock"><?php esc_html_e( '(out of stock)', 'newspack-blocks' ); ?></span>
						<?php endif; ?>
					</label>
				<?php endforeach; ?>
			</fieldset>
		<?php endforeach; ?>
		<p
			class="wp-block-newspack-blocks-fast-checkout-variation-selector__notice"
			role="status"
			aria-live="polite"
			hidden
		></p>
	</form>
	<?php
	return (string) ob_get_clean();
}
