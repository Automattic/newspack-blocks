<?php
/**
 * Server-side rendering of the `newspack-blocks/featured-image` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/featured-image` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_featured_image( $attributes ) {
	ob_start();
	?>
	<p><?php the_post_thumbnail(); ?></p>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/featured-image',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_featured_image',
	)
);
