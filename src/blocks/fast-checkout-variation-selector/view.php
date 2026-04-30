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
 * @param array  $attrs   Block attributes (currently none defined).
 * @param string $content Inner content (unused).
 * @param object $block   Block instance with context.
 * @return string Rendered HTML.
 */
function render_block( $attrs, $content, $block ) {
	// Implemented in Task 2.2.
	return '';
}
