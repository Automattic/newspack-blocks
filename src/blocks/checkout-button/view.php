<?php
/**
 * Checkout Button Block Front-End Functions
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks\Checkout_Button;

use Newspack_Blocks;
use Newspack_Blocks\Modal_Checkout;

/**
 * Register the block.
 */
function register_block() {
	register_block_type_from_metadata(
		__DIR__ . '/block.json',
		[
			'render_callback' => __NAMESPACE__ . '\\render_callback',
		]
	);
}
add_action( 'init', __NAMESPACE__ . '\\register_block' );

/**
 * Render the block.
 *
 * @param array $attributes Block attributes.
 *
 * @return string
 */
function render_callback( $attributes ) {
	$product_id   = $attributes['product'] ?? '';
	$variation_id = $attributes['variation'] ?? '';
	$text         = $attributes['text'] ?? '';

	if ( ( ! $product_id && ! $variation_id ) || ! $text ) {
		return '';
	}

	\Newspack_Blocks\Modal_Checkout::enqueue_modal( $product_id );
	\Newspack_Blocks::enqueue_view_assets( 'checkout-button' );

	$font_size                  = $attributes['fontSize'] ?? '';
	$text_align                 = $attributes['textAlign'] ?? '';
	$style                      = $attributes['style'] ?? [];
	$width                      = $attributes['width'] ?? '';
	$is_variable                = $attributes['is_variable'];
	$after_success_behavior     = $attributes['afterSuccessBehavior'] ?? '';
	$after_success_button_label = $attributes['afterSuccessButtonLabel'] ?? '';
	$after_success_url          = $attributes['afterSuccessURL'] ?? '';

	if ( $is_variable && $variation_id ) {
		$product_id = $variation_id;
	}

	// Generate the button.
	$button_styles  = Newspack_Blocks::block_styles( $attributes );
	$button_classes = Newspack_Blocks::block_classes(
		'button',
		$attributes,
		[
			'wp-block-button__link',
			$text_align ? 'has-text-align-' . esc_attr( $text_align ) : '',
			isset( $style['border']['radius'] ) && $style['border']['radius'] !== 0 ? 'no-border-radius' : '',
		]
	);
	$button = sprintf(
		'<button class="%1$s" style="%2$s" aria-label="%3$s" type="submit">%3$s</button>',
		$button_classes,
		$button_styles,
		$text
	);

	// Generate hidden fields for the form.
	$hidden_fields  = '<input type="hidden" name="newspack_checkout" value="1" />';
	$hidden_fields .= $after_success_behavior ? '<input type="hidden" name="after_success_behavior" value="' . esc_attr( $after_success_behavior ) . '" />' : '';
	$hidden_fields .= $after_success_button_label ? '<input type="hidden" name="after_success_button_label" value="' . esc_attr( $after_success_button_label ) . '" />' : '';
	$hidden_fields .= $after_success_url ? '<input type="hidden" name="after_success_url" value="' . esc_attr( $after_success_url ) . '" />' : '';

	// Generate the form.
	if ( function_exists( 'wc_get_product' ) ) {
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return '';
		}

		$frequency = '';
		if ( class_exists( '\WC_Subscriptions_Product' ) && \WC_Subscriptions_Product::is_subscription( $product ) ) {
			$frequency = \WC_Subscriptions_Product::get_period( $product );
		}

		$name  = $product->get_name();
		$price = $product->get_price();
		if ( ! empty( $attributes['price'] ) ) {
			// Default to the price set in the block attributes.
			$price = $attributes['price'];
		} elseif ( class_exists( '\WC_Name_Your_Price_Helpers' ) && \WC_Name_Your_Price_Helpers::is_nyp( $product_id ) ) {
			// Use suggested price if NYP is active and set for variation.
			$price = \WC_Name_Your_Price_Helpers::get_suggested_price( $product_id );
		}

		$is_variable           = $attributes['is_variable'];
		$variation_id          = $attributes['variation'];
		$product_price_summary = Modal_Checkout::get_summary_card_price_string( $name, $price, $frequency );
		$product_data          = [
			'is_variable'  => $is_variable,
			'variation_id' => $variation_id,
			'product_id'   => $product_id,
		];

		if ( ! $is_variable || $variation_id ) {
			$product_data['price']                 = $price;
			$product_data['product_price_summary'] = $product_price_summary;
		}

		$form = sprintf(
			'<form data-product="%1$s">%2$s %3$s</form>',
			esc_attr( wp_json_encode( $product_data ) ),
			$button,
			$hidden_fields
		);
	} else {
		$form = sprintf(
			'<form>%1$s %2$s</form>',
			$button,
			$hidden_fields
		);
	}

	$container_classes = Newspack_Blocks::block_classes(
		'checkout-button',
		$attributes,
		[
			( $font_size || isset( $style['typography']['fontSize'] ) ) ? 'has-custom-font-size' : '',
			$width ? ' has-custom-width wp-block-button__width-' . esc_attr( $width ) : '',
		]
	);
	return sprintf(
		'<div class="%1$s">%2$s</div>',
		$container_classes,
		$form
	);
}
