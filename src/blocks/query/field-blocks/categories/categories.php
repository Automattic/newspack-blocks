<?php
/**
 * Server-side rendering of the `newspack-blocks/categories` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/categories` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_categories( $attributes ) {
	error_log( __FILE__ . ':' . __LINE__ . print_r( get_the_category_list(), true ) );
	ob_start();
	?>
	<p><?php the_category(); ?></p>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/categories',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
			'criteria'  => array(
				'type' => 'object',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_categories',
	)
);
