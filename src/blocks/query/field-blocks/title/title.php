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
	ob_start();
	?>
	<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/title',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
			'post'      => array(
				'type' => 'object',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_title',
	)
);
