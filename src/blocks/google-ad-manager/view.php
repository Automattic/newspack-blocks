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
		'<div class="%s" id="%s">%s</div>',
		esc_attr( $classes ),
		esc_attr( newspack_blocks_google_add_manager_unique_id() ),
		get_post_meta( $active_ad, 'newspack_ad_code', true )
	);

	Newspack_Blocks::enqueue_view_assets( 'google-ad-manager' );

	return $content;
}

/**
 * Returns a unique ID for the block container
 *
 * @return string Returns a unique ID for the element.
 */
function newspack_blocks_google_add_manager_unique_id() {
	global $newspack_blocks_google_ad_manager_id;
	$newspack_blocks_google_ad_manager_id = intval( $newspack_blocks_google_ad_manager_id ) + 1;
	return 'newspack-blocks-google-ad-manager-id__' . $newspack_blocks_google_ad_manager_id;
}

/**
 * Registers the `newspack-blocks/google-ad-manager` block on server.
 */
function newspack_blocks_register_google_ad_manager() {
	register_block_type(
		'newspack-blocks/google-ad-manager',
		array(
			'attributes'      => array(
				'activeAd' => array(
					'type' => 'integer',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_google_ad_manager',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_google_ad_manager' );
