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
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_title( $attributes ) {
	return the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
}

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
