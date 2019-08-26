<?php
/**
 * Server-side rendering of the `newspack-blocks/title` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/title` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string
 */
function newspack_blocks_render_block_title( $attributes ) {
	return '<h1>Title</h1>';
}

/**
 * Registers the `newspack-blocks/title` block on server.
 */
function newspack_blocks_register_title() {
	register_block_type(
		'newspack-blocks/title',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_title',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_title' );
