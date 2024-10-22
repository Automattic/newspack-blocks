<?php
/**
 * Checkout Button Block Front-End Functions
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks\Checkout_Button;

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
	$product_id = $attributes['product'];

	if ( function_exists( 'wc_get_product' ) ) {
		$product = wc_get_product( $product_id );

		// Check if product can actually be purchased before rendering.
		if ( ! $product || ! $product->is_purchasable() ) {
			return '';
		}

		// Check if product is NYP with no prices set at all.
		if ( class_exists( '\WC_Name_Your_Price_Helpers' ) && \WC_Name_Your_Price_Helpers::is_nyp( $product_id ) ) {
			$price = $product->get_price();
			if ( ! empty( $attributes['price'] ) ) {
				// Default to the price set in the block attributes.
				$price = $attributes['price'];
			}

			$suggested_price = \WC_Name_Your_Price_Helpers::get_suggested_price( $product_id );
			$minimum_price   = \WC_Name_Your_Price_Helpers::get_minimum_price( $product_id );
			if ( empty( $price ) && empty( $suggested_price ) && empty( $minimum_price ) ) {
				return '';
			}
		}
	}

	if ( $attributes['is_variable'] && ! empty( $attributes['variation'] ) ) {
		$product_id = $attributes['variation'];
	}

	\Newspack_Blocks\Modal_Checkout::enqueue_modal( $product_id );
	\Newspack_Blocks::enqueue_view_assets( 'checkout-button' );
	return $content;
}
