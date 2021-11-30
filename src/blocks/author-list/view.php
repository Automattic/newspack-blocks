<?php
/**
 * Server-side render functions for the Author Profile block.
 *
 * @package WordPress
 */

/**
 * Dynamic block registration.
 */
function newspack_blocks_register_author_list() {
	$block_json = json_decode(
		file_get_contents( __DIR__ . '/block.json' ), // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		true
	);

	register_block_type(
		'newspack-blocks/' . $block_json['name'],
		[
			'attributes'      => $block_json['attributes'],
			'render_callback' => 'newspack_blocks_render_block_author_list',
		]
	);
}

/**
 * Block render callback.
 *
 * @param array $attributes Block attributes.
 */
function newspack_blocks_render_block_author_list( $attributes ) {
	// Enqueue required front-end assets.
	Newspack_Blocks::enqueue_view_assets( 'author-list' );
	Newspack_Blocks::enqueue_view_assets( 'author-profile' );

	// Gather attributes.
	$exclude_ids     = array_map(
		function( $exclusion ) {
			return (int) $exclusion['value'];
		},
		$attributes['exclude']
	);
	$layout          = $attributes['layout'];
	$text_size       = $attributes['textSize'];
	$show_separators = $attributes['showSeparators'];

	return;
}

add_action( 'init', 'newspack_blocks_register_author_list' );
