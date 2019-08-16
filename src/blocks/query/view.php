<?php
/**
 * Server-side rendering of the `newspack-blocks/query` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/query` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_query( $attributes ) {
	return __( 'Query Block TK', 'newspack-blocks' );
}

/**
 * Registers the `newspack-blocks/query` block on server.
 */
function newspack_blocks_register_query() {
	register_block_type(
		'newspack-blocks/query',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_query',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_query' );
