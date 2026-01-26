<?php
/**
 * Server-side rendering of the `newspack-blocks/author-profile-bio` block.
 *
 * @package Newspack_Blocks
 */

/**
 * Register the Author Profile Bio block.
 */
function newspack_blocks_register_author_profile_bio() {
	$is_nested_mode = defined( 'NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS' ) && NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS;

	register_block_type(
		__DIR__ . '/block.json',
		[
			'render_callback' => 'newspack_blocks_render_author_profile_bio',
			'supports'        => [
				'inserter' => $is_nested_mode,
			],
		]
	);
}
add_action( 'init', 'newspack_blocks_register_author_profile_bio' );

/**
 * Renders the Author Profile Bio block on the server.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string The rendered block markup.
 */
function newspack_blocks_render_author_profile_bio( $attributes, $content, $block ) {
	$author = $block->context['newspack-blocks/author'] ?? null;
	if ( ! $author || empty( $author['bio'] ) ) {
		return '';
	}

	$truncate        = $attributes['truncate'] ?? false;
	$truncate_length = $attributes['truncateLength'] ?? 200;

	$bio = $author['bio'];

	if ( $truncate && strlen( wp_strip_all_tags( $bio ) ) > $truncate_length ) {
		// Truncate plain text, then wrap in paragraph.
		$plain_bio = wp_strip_all_tags( $bio );
		$bio       = substr( $plain_bio, 0, $truncate_length ) . '…';
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'wp-block-newspack-blocks-author-profile-bio',
		]
	);

	return sprintf(
		'<div %s><p>%s</p></div>',
		$wrapper_attributes,
		wp_kses_post( $bio )
	);
}
