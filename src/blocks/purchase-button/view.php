<?php
/**
 * Server-side rendering of the `newspack-blocks/purchase-button` block.
 *
 * @package WordPress
 */

/**
 * Registers the `newspack-blocks/purcharse-button` block on server.
 */
function newspack_blocks_register_purchase_button() {
	register_block_type_from_metadata(
		__DIR__ . '/block.json',
		array(
			'render_callback' => 'newspack_blocks_purchase_button_render_block',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_donate' );
