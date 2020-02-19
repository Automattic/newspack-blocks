<?php
/**
 * Register Newspack block patterns.
 *
 * @package Newspack_Blocks
 */

add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/pattern1.txt'), //phpcs:ignore
				'icon'     => plugins_url( 'src/patterns/icons/pattern-icon.png', __FILE__ ),
				'title'    => __( 'Homepage Layout 1', 'newspack-blocks' ),
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
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/pattern2.txt'), //phpcs:ignore
				'icon'     => plugins_url( 'src/patterns/icons/pattern-icon.png', __FILE__ ),
				'title'    => __( 'Homepage Layout 2', 'newspack-blocks' ),
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
				'title'    => __( '3 columns', 'newspack-blocks' ),
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
			$patterns[] = [
				'category' => __( 'Donations', 'newspack-blocks' ),
				'content'  => file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/pattern3.txt'), //phpcs:ignore
				'icon'     => plugins_url( 'src/patterns/icons/pattern-icon.png', __FILE__ ),
				'title'    => __( 'Donate Layout 1', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
