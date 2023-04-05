<?php
/**
 * Modal Checkout Functions
 *
 * @package WordPress
 */

namespace Newspack_Blocks\Purchase_Button;

/**
 * Process checkout request for modal.
 */
function process_checkout_request() {
	$is_newspack_checkout = filter_input( INPUT_GET, 'newspack_checkout', FILTER_SANITIZE_NUMBER_INT );
	$product_id           = filter_input( INPUT_GET, 'product_id', FILTER_SANITIZE_NUMBER_INT );
	if ( ! $is_newspack_checkout || ! $product_id ) {
		return;
	}

	\WC()->cart->empty_cart();

	$referer    = wp_get_referer();
	$params     = [];
	$parsed_url = wp_parse_url( $referer );

	// Get URL params appended to the referer URL.
	if ( ! empty( $parsed_url['query'] ) ) {
		wp_parse_str( $parsed_url['query'], $params );
	}

	if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
		$referer_post_id = wpcom_vip_url_to_postid( $referer );
	} else {
		$referer_post_id = url_to_postid( $referer ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
	}

	$referer_tags       = [];
	$referer_categories = [];
	$tags               = get_the_tags( $referer_post_id );
	if ( $tags && ! empty( $tags ) ) {
		$referer_tags = array_map(
			function ( $item ) {
				return $item->slug;
			},
			$tags
		);
	}

	$categories = get_the_category( $referer_post_id );
	if ( $categories && ! empty( $categories ) ) {
		$referer_categories = array_map(
			function ( $item ) {
				return $item->slug;
			},
			$categories
		);
	}

	\WC()->cart->add_to_cart(
		$product_id,
		1,
		0,
		[],
		[
			'referer'           => $referer,
			'newspack_popup_id' => filter_input( INPUT_GET, 'newspack_popup_id', FILTER_SANITIZE_NUMBER_INT ),
		]
	);

	$query_args = [];

	if ( ! empty( $referer_tags ) ) {
		$query_args['referer_tags'] = implode( ',', $referer_tags );
	}
	if ( ! empty( $referer_categories ) ) {
		$query_args['referer_categories'] = implode( ',', $referer_categories );
	}
	$query_args['modal_checkout'] = 1;

	// Pass through UTM params so they can be forwarded to the WooCommerce checkout flow.
	foreach ( $params as $param => $value ) {
		if ( 'utm' === substr( $param, 0, 3 ) ) {
			$param                = sanitize_text_field( $param );
			$query_args[ $param ] = sanitize_text_field( $value );
		}
	}

	$checkout_url = add_query_arg(
		$query_args,
		\wc_get_page_permalink( 'checkout' )
	);

	// Redirect to checkout.
	\wp_safe_redirect( apply_filters( 'newspack_blocks_checkout_url', $checkout_url, $donation_value, $donation_frequency ) );
	exit;
}
add_action( 'template_redirect', __NAMESPACE__ . '\process_checkout_request' );
