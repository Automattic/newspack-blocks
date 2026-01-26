<?php
/**
 * Server-side rendering of the `newspack-blocks/author-profile-name` block.
 *
 * @package Newspack_Blocks
 */

/**
 * Register the Author Profile Name block.
 */
function newspack_blocks_register_author_profile_name() {
	$is_nested_mode = defined( 'NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS' ) && NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS;

	register_block_type(
		__DIR__ . '/block.json',
		[
			'render_callback' => 'newspack_blocks_render_author_profile_name',
			'supports'        => [
				'inserter' => $is_nested_mode,
			],
		]
	);
}
add_action( 'init', 'newspack_blocks_register_author_profile_name' );

/**
 * Renders the Author Profile Name block on the server.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string The rendered block markup.
 */
function newspack_blocks_render_author_profile_name( $attributes, $content, $block ) {
	$author = $block->context['newspack-blocks/author'] ?? null;
	if ( ! $author || empty( $author['name'] ) ) {
		return '';
	}

	$heading_level   = $attributes['headingLevel'] ?? 3;
	$link_to_archive = $attributes['linkToArchive'] ?? true;

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'wp-block-newspack-blocks-author-profile-name',
		]
	);

	$name_html = esc_html( $author['name'] );

	if ( $link_to_archive && ! empty( $author['url'] ) ) {
		$name_html = sprintf(
			'<a href="%s">%s</a>',
			esc_url( $author['url'] ),
			$name_html
		);
	}

	$heading_tag = 'h' . absint( $heading_level );

	return sprintf(
		'<div %s><%s class="author-profile-name__heading">%s</%s></div>',
		$wrapper_attributes,
		$heading_tag,
		$name_html,
		$heading_tag
	);
}
