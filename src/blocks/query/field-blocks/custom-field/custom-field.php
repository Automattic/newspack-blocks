<?php

/**
 * Server-side rendering of the `newspack-blocks/custom-field` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/custom-field` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_custom_field($attributes)
{
	ob_start();
	?>
	<p><?php the_category(); ?></p>
<?php
	return ob_get_clean();
}


register_block_type(
	'newspack-blocks/custom-field',
	array(
		'attributes' => [
			'className' => [ 'type' => 'string', ],
			'criteria'  => [ 'type' => 'object', ],
			'field'     => [ 'type' => 'string', ],
		],
		'render_callback' => 'newspack_blocks_render_block_categories',
	)
);
