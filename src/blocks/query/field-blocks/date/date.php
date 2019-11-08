<?php
/**
 * Server-side rendering of the `newspack-blocks/date` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/date` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_date( $attributes ) {
	$time_string = '<span class="posted-on"><time class="entry-date published updated" datetime="%1$s">%2$s</time></span>';

	if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
		$time_string = '<span class="posted-on"><time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time></span>';
	}

	$time_string = sprintf(
		$time_string,
		esc_attr( get_the_date( DATE_W3C ) ),
		esc_html( get_the_date() ),
		esc_attr( get_the_modified_date( DATE_W3C ) ),
		esc_html( get_the_modified_date() )
	);

	return $time_string;
}

register_block_type(
	'newspack-blocks/date',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_date',
	)
);
