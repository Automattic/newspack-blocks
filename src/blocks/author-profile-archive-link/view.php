<?php
/**
 * Server-side rendering of the `newspack-blocks/author-profile-archive-link` block.
 *
 * @package Newspack_Blocks
 */

/**
 * Register the Author Profile Archive Link block.
 */
function newspack_blocks_register_author_profile_archive_link() {
	$is_nested_mode = defined( 'NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS' ) && NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS;

	register_block_type(
		__DIR__ . '/block.json',
		[
			'render_callback' => 'newspack_blocks_render_author_profile_archive_link',
			'supports'        => [
				'inserter' => $is_nested_mode,
			],
		]
	);
}
add_action( 'init', 'newspack_blocks_register_author_profile_archive_link' );

/**
 * Renders the Author Profile Archive Link block on the server.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string The rendered block markup.
 */
function newspack_blocks_render_author_profile_archive_link( $attributes, $content, $block ) {
	$author = $block->context['newspack-blocks/author'] ?? null;
	if ( ! $author || empty( $author['url'] ) ) {
		return '';
	}

	// translators: %s is the author name.
	$label = $attributes['label'] ?? __( 'More by %s', 'newspack-blocks' );

	// Replace %s with author name.
	$display_label = sprintf( $label, esc_html( $author['name'] ) );

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'wp-block-newspack-blocks-author-profile-archive-link',
		]
	);

	return sprintf(
		'<div %s><a href="%s">%s</a></div>',
		$wrapper_attributes,
		esc_url( $author['url'] ),
		$display_label
	);
}
