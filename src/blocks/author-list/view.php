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
	error_log( print_r( $attributes, true ) );
	return;
}

add_action( 'init', 'newspack_blocks_register_author_list' );
