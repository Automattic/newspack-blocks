<?php
/**
 * Server-side rendering of the `newspack-blocks/author-bio` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/author-bio` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_google_ad_manager( $attributes ) {

	$active_ad = isset( $attributes['activeAd'] ) ? (int) $attributes['activeAd'] : 0;
	if ( 1 > $active_ad ) {
		return '';
	}

	$classes = Newspack_Blocks::block_classes( 'newspack-blocks-google-ad-manager', $attributes );

	$content = sprintf(
		"<div class=\"%s\">%s</div>",
		esc_attr( $classes ),
		get_post_meta( $active_ad, 'newspack_ad_code', true )
	);

	Newspack_Blocks::enqueue_view_assets( 'google-ad-manager' );

	return $content;
}

/**
 * Registers the `newspack-blocks/google-ad-manager` block on server.
 */
function newspack_blocks_register_google_ad_manager() {
	register_block_type(
		'newspack-blocks/google-ad-manager',
		array(
			'attributes'      => array(
				'activeAd'   => array(
					'type'    => 'integer',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_google_ad_manager',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_google_ad_manager' );
