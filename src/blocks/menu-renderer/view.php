<?php
/**
 * Server-side rendering of the `newspack-blocks/menu-renderer` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/menu-renderer` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_menu_renderer( $attributes ) {
	$menu_slug = isset( $attributes['menu_slug'] ) ? $attributes['menu_slug'] : null;
	$args      = array(
		'menu_id' => $menu_slug,
		'echo'    => false,
	);
	return $menu_slug ? wp_nav_menu( $args ) : null;
}

/**
 * Register the `newspack-blocks/menu-renderer` block on server.
 */
function newspack_blocks_register_menu_renderer() {
	register_block_type(
		'newspack-blocks/menu-renderer',
		array(
			'attributes'      => array(
				'menu_slug' => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_menu_renderer',
		)
	);
}

add_action( 'init', 'newspack_blocks_register_menu_renderer' );
