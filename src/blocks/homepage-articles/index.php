<?php
/**
 * Server-side rendering of the `newspack/homepage-articles` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/homepage-articles` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_newspack_homepage_articles( $attributes ) {
	$list_items_markup = '';
	$posts_per_page    = isset( $attributes['postsToShow'] ) ? $attributes['postsToShow'] : 5;
	$args              = array(
		'post_status'      => 'publish',
		'order'            => isset( $attributes['order'] ) ? $attributes['order'] : 'desc',
		'orderby'          => isset( $attributes['orderBy'] ) ? $attributes['orderBy'] : 'date',
		'suppress_filters' => false,
	);

	if ( isset( $attributes['categories'] ) ) {
		$args['category'] = $attributes['categories'];
	}
	$posts_to_show = Newspack_Blocks::newspack_blocks_posts_with_args_and_limit( $args, $posts_per_page );

	foreach ( $posts_to_show as $post ) {
		$title = get_the_title( $post );
		if ( ! $title ) {
			$title = __( '(Untitled)', 'newspack-blocks' );
		}
		$list_items_markup .= sprintf(
			'<li><a href="%1$s">%2$s</a>',
			esc_url( get_permalink( $post ) ),
			esc_html( $title )
		);

		if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
			$list_items_markup .= sprintf(
				'<time datetime="%1$s" class="wp-block-latest-posts__post-date">%2$s</time>',
				esc_attr( get_the_date( 'c', $post ) ),
				esc_html( get_the_date( '', $post ) )
			);
		}

		$list_items_markup .= "</li>\n";
	}

	$class = 'wp-block-latest-posts';
	if ( isset( $attributes['align'] ) ) {
		$class .= ' align' . $attributes['align'];
	}

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$class .= ' is-grid';
	}

	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$class .= ' columns-' . $attributes['columns'];
	}

	if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
		$class .= ' has-dates';
	}

	if ( isset( $attributes['className'] ) ) {
		$class .= ' ' . $attributes['className'];
	}

	$block_content = sprintf(
		'<ul class="%1$s">%2$s</ul>',
		esc_attr( $class ),
		$list_items_markup
	);

	return $block_content;
}

/**
 * Registers the `newspack-blocks/homepage-articles` block on server.
 */
register_block_type(
	'newspack-blocks/homepage-articles',
	array(
		'render_callback' => 'newspack_blocks_render_block_newspack_homepage_articles',
	)
);
