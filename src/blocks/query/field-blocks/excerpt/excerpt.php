<?php
/**
 * Server-side rendering of the `newspack-blocks/excerpt` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/excerpt` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_excerpt( $attributes ) {
	ob_start();
	?>
	<p><?php the_excerpt(); ?></p>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/excerpt',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
			'post'      => array(
				'type' => 'object',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_excerpt',
	)
);
