<?php
/**
 * Server-side rendering of the `newspack-blocks/post` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/post` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_post( $attributes ) {
	return __( 'Query Post TK', 'newspack-blocks' );
}

/**
 * Registers the `newspack-blocks/post` block on server.
 */
function newspack_blocks_register_post() {
	register_block_type(
		'newspack-blocks/post',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
				'post'      => array(
					'type' => 'object',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_post',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_post' );
