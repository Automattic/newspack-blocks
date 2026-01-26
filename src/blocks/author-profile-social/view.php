<?php
/**
 * Server-side rendering of the `newspack-blocks/author-profile-social` block.
 *
 * @package Newspack_Blocks
 */

/**
 * Register the Author Profile Social Links block.
 */
function newspack_blocks_register_author_profile_social() {
	$is_nested_mode = defined( 'NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS' ) && NEWSPACK_AUTHOR_PROFILE_NESTED_BLOCKS;

	register_block_type(
		__DIR__ . '/block.json',
		[
			'render_callback' => 'newspack_blocks_render_author_profile_social',
			'supports'        => [
				'inserter' => $is_nested_mode,
			],
		]
	);
}
add_action( 'init', 'newspack_blocks_register_author_profile_social' );

/**
 * Renders the Author Profile Social Links block on the server.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Block default content.
 * @param WP_Block $block      Block instance.
 *
 * @return string The rendered block markup.
 */
function newspack_blocks_render_author_profile_social( $attributes, $content, $block ) {
	$author = $block->context['newspack-blocks/author'] ?? null;
	if ( ! $author ) {
		return '';
	}

	$show_email = $attributes['showEmail'] ?? false;
	$icon_size  = $attributes['iconSize'] ?? 24;

	// Build social links array.
	$social_links = [];

	if ( ! empty( $author['social'] ) && is_array( $author['social'] ) ) {
		foreach ( $author['social'] as $service => $data ) {
			if ( ! empty( $data['url'] ) ) {
				$social_links[ $service ] = $data;
			}
		}
	}

	// Add email if enabled.
	if ( $show_email && ! empty( $author['email'] ) ) {
		$social_links['email'] = [
			'url' => 'mailto:' . $author['email'],
			'svg' => null,
		];
	}

	if ( empty( $social_links ) ) {
		return '';
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		[
			'class' => 'wp-block-newspack-blocks-author-profile-social',
			'style' => sprintf( '--icon-size: %dpx;', absint( $icon_size ) ),
		]
	);

	$output = '<ul class="author-profile-social__list">';

	foreach ( $social_links as $service => $social_data ) {
		$output .= '<li>';
		$output .= sprintf( '<a href="%s">', esc_url( $social_data['url'] ) );

		if ( ! empty( $social_data['svg'] ) ) {
			$output .= sprintf(
				'<span style="width: %dpx; height: %dpx;">%s</span>',
				absint( $icon_size ),
				absint( $icon_size ),
				Newspack_Blocks::sanitize_svg( $social_data['svg'] )
			);
		} else {
			$output .= sprintf( '<span class="service-name">%s</span>', esc_html( $service ) );
		}

		$output .= '</a></li>';
	}

	$output .= '</ul>';

	return sprintf( '<div %s>%s</div>', $wrapper_attributes, $output );
}
