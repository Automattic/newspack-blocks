<?php
/**
 * Register Newspack block patterns.
 *
 * @package Newspack_Blocks
 */

/**
 * Homepage Posts.
 */
add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/2-columns.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'icon'     => plugins_url( 'src/patterns/icons/homepage-posts/2-columns.png', __FILE__ ),
				'title'    => __( 'Two columns; two-thirds, one-third split', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/3-columns.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'icon'     => plugins_url( 'src/patterns/icons/homepage-posts/3-columns.png', __FILE__ ),
				'title'    => __( 'Three columns; equal split', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);

/**
 * Donations.
 */
add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$patterns[] = [
				'category' => __( 'Donations', 'newspack-blocks' ),
				'content'  => file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/layout-1.txt'), //phpcs:ignore
				'icon'     => plugins_url( 'src/patterns/icons/pattern-icon.png', __FILE__ ),
				'title'    => __( 'Donate Layout 1', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
