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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-1.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-1.png', __FILE__ ),
				'title'    => __( 'Style 1', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-2.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-2.png', __FILE__ ),
				'title'    => __( 'Style 2', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-3.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-3.png', __FILE__ ),
				'title'    => __( 'Style 3', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-4.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-4.png', __FILE__ ),
				'title'    => __( 'Style 4', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-5.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-5.png', __FILE__ ),
				'title'    => __( 'Style 5', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-6.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-6.png', __FILE__ ),
				'title'    => __( 'Style 6', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-7.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-7.png', __FILE__ ),
				'title'    => __( 'Style 7', 'newspack-blocks' ),
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
			$from_json = json_decode( file_get_contents( NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/patterns/markup/homepage-posts/style-8.json'), true ); //phpcs:ignore
			$patterns[] = [
				'category' => __( 'Homepage Posts', 'newspack-blocks' ),
				'content'  => $from_json['content'],
				'image'    => plugins_url( 'src/patterns/images/homepage-posts/style-8.png', __FILE__ ),
				'title'    => __( 'Style 8', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
