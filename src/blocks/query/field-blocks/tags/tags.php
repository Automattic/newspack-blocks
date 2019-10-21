<?php
/**
 * Server-side rendering of the `newspack-blocks/tags` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/tags` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_tags( $attributes ) {
	ob_start();
	?>
	<p><?php the_tags(); ?></p>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/tags',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_tags',
	)
);
