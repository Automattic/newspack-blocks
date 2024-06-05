<?php
/**
 * Checkout Button Block Front-End Functions
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks\Checkout_Button;

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
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 *
 * @return string
 */
function render_callback( $attributes, $content ) {
	if ( empty( $attributes['product'] ) ) {
		return '';
	}
	$product_id  = $attributes['product'];
	$is_variable = $attributes['is_variable'];
	if ( $is_variable && ! empty( $attributes['variation'] ) ) {
		$product_id = $attributes['variation'];
	}

	if ( ! $is_variable && function_exists( 'wc_get_product' ) ) {
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return $content;
		}

		$frequency = '';
		if ( class_exists( '\WC_Subscriptions_Product' ) && \WC_Subscriptions_Product::is_subscription( $product ) ) {
			$frequency = \WC_Subscriptions_Product::get_period( $product );
		}

		$name  = $product->get_name();
		$price = $product->get_price();
		if ( isset( $attributes['price'] ) && $attributes['price'] ) {
			// Default to the price set in the block attributes.
			$price = $attributes['price'];
		} elseif ( class_exists( '\WC_Name_Your_Price_Helpers' ) && \WC_Name_Your_Price_Helpers::is_nyp( $product_id ) ) {
			// Use suggested price if NYP is active and set for variation.
			$price = \WC_Name_Your_Price_Helpers::get_suggested_price( $product_id );
		}

		$product_price_summary = Modal_Checkout::get_summary_card_price_string( $name, $price, $frequency );
		$product_data          = wp_json_encode(
			[
				'price'                 => $price,
				'product_price_summary' => $product_price_summary,
				'product_id'            => $product_id,
				'variation_id'          => $attributes['variation'],
				'is_variable'           => $attributes['is_variable'],
			]
		);

		$pos = strpos( $content, '<form>' );
		if ( $pos ) {
			$content = substr_replace(
				$content,
				'<form data-product="' . esc_attr( $product_data ) . '">',
				$pos,
				0
			);
		}
	}

	\Newspack_Blocks\Modal_Checkout::enqueue_modal( $product_id );
	\Newspack_Blocks::enqueue_view_assets( 'checkout-button' );

	return $content;
}
