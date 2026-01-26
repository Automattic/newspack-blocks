<?php
/**
 * Server-side rendering of the `newspack-blocks/author-profile-meta` block.
 *
 * @package Newspack_Blocks
 */

/**
 * Register the Author Profile Meta block.
 */
function newspack_blocks_register_author_profile_meta() {
	$is_nested_mode = defined( 'NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS' ) && NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS;

	register_block_type(
		__DIR__ . '/block.json',
		[
			'render_callback' => 'newspack_blocks_render_author_profile_meta',
			'supports'        => [
				'inserter' => $is_nested_mode,
			],
		]
	);
}
add_action( 'init', 'newspack_blocks_register_author_profile_meta' );

/**
 * Renders the Author Profile Meta block on the server.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string The rendered block markup.
 */
function newspack_blocks_render_author_profile_meta( $attributes, $content, $block ) {
	$author = $block->context['newspack-blocks/author'] ?? null;
	if ( ! $author ) {
		return '';
	}

	// Require Newspack Author Custom Fields.
	if ( ! class_exists( '\Newspack\Authors_Custom_Fields' ) ) {
		return '';
	}

	$show_job_title = $attributes['showJobTitle'] ?? true;
	$show_role      = $attributes['showRole'] ?? false;
	$show_employer  = $attributes['showEmployer'] ?? false;
	$show_phone     = $attributes['showPhone'] ?? false;

	$output = '';

	// Job title.
	if ( $show_job_title && ! empty( $author['newspack_job_title'] ) ) {
		$output .= sprintf(
			'<p class="author-profile-meta__job-title">%s</p>',
			esc_html( $author['newspack_job_title'] )
		);
	}

	// Employment (role + employer combined).
	$employment_parts = [];
	if ( $show_role && ! empty( $author['newspack_role'] ) ) {
		$employment_parts[] = $author['newspack_role'];
	}
	if ( $show_employer && ! empty( $author['newspack_employer'] ) ) {
		$employment_parts[] = $author['newspack_employer'];
	}
	if ( ! empty( $employment_parts ) ) {
		$output .= sprintf(
			'<p class="author-profile-meta__employment">%s</p>',
			esc_html( implode( ', ', $employment_parts ) )
		);
	}

	// Phone number.
	if ( $show_phone && ! empty( $author['newspack_phone_number'] ) ) {
		$output .= sprintf(
			'<p class="author-profile-meta__phone">%s</p>',
			esc_html( $author['newspack_phone_number'] )
		);
	}

	if ( empty( $output ) ) {
		return '';
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'wp-block-newspack-blocks-author-profile-meta',
		]
	);

	return sprintf( '<div %s>%s</div>', $wrapper_attributes, $output );
}
