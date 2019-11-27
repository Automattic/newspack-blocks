<?php
/**
 * Server-side rendering of the `newspack-blocks/homepage-posts` block.
 */

/**
 * Registers and enqueues AMP scripts.
 */
function newspack_blocks_enqueue_amp_scripts() {
	$amp_scripts = [
		'amp-runtime'  => 'https://cdn.ampproject.org/v0.js',
		'amp-list'     => 'https://cdn.ampproject.org/v0/amp-list-0.1.js',
		'amp-bind'     => 'https://cdn.ampproject.org/v0/amp-bind-0.1.js',
		'amp-form'     => 'https://cdn.ampproject.org/v0/amp-form-0.1.js',
		'amp-mustache' => 'https://cdn.ampproject.org/v0/amp-mustache-0.2.js',
	];

	foreach ( $amp_scripts as $handle => $src ) {
		if ( ! wp_script_is( $handle, 'registered' ) ) {
			$deps = 'amp-runtime' === $handle ? [] : [ 'amp-runtime' ];
			// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			wp_register_script( $handle, $src, $deps, null, true );
		}
	}

	wp_enqueue_script( 'amp-list' );
	wp_enqueue_script( 'amp-bind' );
	wp_enqueue_script( 'amp-form' );
	wp_enqueue_script( 'amp-mustache' );
}

/**
 * Renders the `newspack-blocks/author-bio` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_homepage_articles( $attributes ) {

	// If this is an AMP request then these script are already included
	// so no need to re-enqueue
	if ( ! Newspack_Blocks::is_amp() ) {
		newspack_blocks_enqueue_amp_scripts();
	}

	$article_query = new WP_Query( newspack_build_articles_query( $attributes ) );

	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes, [ 'wpnbha' ] );

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' columns-' . $attributes['columns'];
	}
	if ( $attributes['showImage'] ) {
		$classes .= ' show-image';
	}
	if ( $attributes['showImage'] && isset( $attributes['mediaPosition'] ) ) {
		$classes .= ' image-align' . $attributes['mediaPosition'];
	}
	if ( isset( $attributes['typeScale'] ) ) {
		$classes .= ' ts-' . $attributes['typeScale'];
	}
	if ( $attributes['showImage'] && isset( $attributes['imageScale'] ) ) {
		$classes .= ' is-' . $attributes['imageScale'];
	}
	if ( $attributes['showImage'] && $attributes['mobileStack'] ) {
		$classes .= ' mobile-stack';
	}
	if ( $attributes['showCaption'] ) {
		$classes .= ' show-caption';
	}
	if ( $attributes['showCategory'] ) {
		$classes .= ' show-category';
	}
	if ( isset( $attributes['className'] ) ) {
		$classes .= ' ' . $attributes['className'];
	}

	if ( '' !== $attributes['textColor'] || '' !== $attributes['customTextColor'] ) {
		$classes .= ' has-text-color';
	}
	if ( '' !== $attributes['textColor'] ) {
		$classes .= ' has-' . $attributes['textColor'] . '-color';
	}

	$styles = '';

	if ( '' !== $attributes['customTextColor'] ) {
		$styles = 'color: ' . $attributes['customTextColor'] . ';';
	}

	$articles_rest_url = add_query_arg( $attributes, rest_url( '/newspack-blocks/v1/articles' ) );

	ob_start();

	if ( $article_query->have_posts() ) :
		?>
		<div>

			<?php if ( '' !== $attributes['sectionHeader'] ) : ?>
				<h2 class="article-section-title">
					<span><?php echo wp_kses_post( $attributes['sectionHeader'] ); ?></span>
				</h2>
			<?php
			endif;

			?>
			<div data-posts-container class="<?php echo esc_attr( $classes ); ?>" style="<?php echo esc_attr( $styles ); ?>">
				<?php
				/*
				* We are not using an AMP-based renderer on AMP requests because it has limitations
				* around dynamically calculating the height of the the article list on load.
				* As a result we render the same standards-based markup for all requests.
				*/
				echo newspack_blocks_template_inc( __DIR__ . '/articles-list.php', [
					'articles_rest_url' => $articles_rest_url,
					'article_query'     => $article_query,
					'attributes'        => $attributes,
				] );
				?>
			</div>
			<?php

			/*
			 * AMP-requests cannot contain client-side scripting (eg: JavaScript). As a result
			 * we do not display the "More" button on AMP-requests. This feature is deliberately
			 * disabled.
			 *
			 * @see https://github.com/Automattic/newspack-blocks/pull/226#issuecomment-558695909
			 * @see https://wp.me/paYJgx-jW
			 */
			$page = $article_query->paged ?? 1;
			$has_more_pages = (++$page) <= $article_query->max_num_pages;

			if ( ! Newspack_Blocks::is_amp() && $has_more_pages ) : ?>
				<button type="button" data-load-more-url="<?php echo $articles_rest_url ?>"><?php _e( 'Load more articles' ); ?></button>
				<p data-load-more-loading-text hidden>Loading...</p>
				<p data-load-more-error-text hidden>Something went wrong. Please refresh the page and/or try again.</p>
			<?php endif; ?>
		</div>
	<?php
	endif;

	$content = ob_get_clean();
	Newspack_Blocks::enqueue_view_assets( 'homepage-articles' );

	return $content;
}

/**
 * Builds and returns query args based on block attributes.
 *
 * @param array $attributes
 *
 * @return array
 */
function newspack_build_articles_query( $attributes ) {
	global $newspack_blocks_post_id;

	if ( ! $newspack_blocks_post_id ) {
		$newspack_blocks_post_id = [];
	}
	$authors        = $attributes['authors'] ?? [];
	$categories     = $attributes['categories'] ?? [];
	$tags           = $attributes['tags'] ?? [];
	$specific_posts = $attributes['specificPosts'] ?? [];
	$posts_to_show  = intval( $attributes['postsToShow'] ?? 3 );
	$specific_mode  = intval( $attributes['specificMode'] ?? 0 );
	$args           = [
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'ignore_sticky_posts' => true,
	];
	if ( $specific_mode && $specific_posts ) {
		$args['post__in'] = $specific_posts;
		$args['orderby']  = 'post__in';
	} else {
		$args['posts_per_page'] = $posts_to_show + count( $newspack_blocks_post_id );

		if ( $authors ) {
			$args['author__in'] = $authors;
		}
		if ( $categories ) {
			$args['category__in'] = $categories;
		}
		if ( $tags ) {
			$args['tag__in'] = $tags;
		}
	}

	return $args;
}

/**
 * Registers the `newspack-blocks/homepage-articles` block on server.
 */
function newspack_blocks_register_homepage_articles() {
	$block = json_decode(
		file_get_contents( __DIR__ . '/block.json' ),
		true
	);

	register_block_type(
		apply_filters( 'newspack_blocks_block_name', $block['name'] ),
		apply_filters(
			'newspack_blocks_block_args',
			[
				'attributes'      => $block['attributes'],
				'render_callback' => 'newspack_blocks_render_block_homepage_articles',
			],
			$block['name']
		)
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );

/**
 * Prepare an array of authors, taking presence of CoAuthors Plus into account.
 *
 * @return array Array of WP_User objects.
 */
function newspack_blocks_prepare_authors() {
	if ( function_exists( 'coauthors_posts_links' ) ) {
		$authors = get_coauthors();
		foreach ( $authors as $author ) {
			// Check if this is a guest author post type.
			if ( 'guest-author' === get_post_type( $author->ID ) ) {
				// If yes, make sure the author actually has an avatar set; otherwise, coauthors_get_avatar returns a featured image.
				if ( get_post_thumbnail_id( $author->ID ) ) {
					$author->avatar = coauthors_get_avatar( $author, 48 );
				} else {
					// If there is no avatar, force it to return the current fallback image.
					$author->avatar = get_avatar( ' ' );
				}
			} else {
				$author->avatar = coauthors_get_avatar( $author, 48 );
			}
			$author->url = get_author_posts_url( $author->ID, $author->user_nicename );
		}

		return $authors;
	}
	$id = get_the_author_meta( 'ID' );

	return [
		(object) [
			'ID'            => $id,
			'avatar'        => get_avatar( $id, 48 ),
			'url'           => get_author_posts_url( $id ),
			'user_nicename' => get_the_author(),
			'display_name'  => get_the_author_meta( 'display_name' ),
		],
	];
}

/**
 * Renders author avatar markup.
 *
 * @param array $author_info Author info array.
 *
 * @return string Returns formatted Avatar markup
 */
function newspack_blocks_format_avatars( $author_info ) {
	$elements = array_map(
		function ( $author ) {
			return sprintf( '<a href="%s">%s</a>', $author->url, $author->avatar );
		},
		$author_info
	);

	return implode( '', $elements );
}

/**
 * Renders byline markup.
 *
 * @param array $author_info Author info array.
 *
 * @return string Returns byline markup.
 */
function newspack_blocks_format_byline( $author_info ) {
	$index    = -1;
	$elements = array_merge(
		[
			esc_html_x( 'by', 'post author', 'newspack-blocks' ) . ' ',
		],
		array_reduce(
			$author_info,
			function ( $accumulator, $author ) use ( $author_info, &$index ) {
				$index ++;
				$penultimate = count( $author_info ) - 2;

				return array_merge(
					$accumulator,
					[
						sprintf(
							/* translators: 1: author link. 2: author name. 3. variable seperator (comma, 'and', or empty) */
							'<span class="author vcard"><a class="url fn n" href="%1$s">%2$s</a></span>',
							esc_url( get_author_posts_url( $author->ID, $author->user_nicename ) ),
							esc_html( $author->display_name )
						),
						( $index < $penultimate ) ? ', ' : '',
						( count( $author_info ) > 1 && $penultimate === $index ) ? esc_html_x( ' and ', 'post author', 'newspack-blocks' ) : '',
					]
				);
			},
			[]
		)
	);

	return implode( '', $elements );
}
