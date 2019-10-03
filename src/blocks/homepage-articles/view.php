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
function newspack_blocks_render_block_homepage_articles( $attributes ) {
	global $newspack_blocks_post_id;
	if ( ! $newspack_blocks_post_id ) {
		$newspack_blocks_post_id = array();
	}
	$author        = isset( $attributes['author'] ) ? $attributes['author'] : '';
	$categories    = isset( $attributes['categories'] ) ? $attributes['categories'] : '';
	$tags          = isset( $attributes['tags'] ) ? $attributes['tags'] : '';
	$single        = isset( $attributes['single'] ) ? $attributes['single'] : '';
	$posts_to_show = intval( $attributes['postsToShow'] );
	$single_mode   = intval( $attributes['singleMode'] );
	$args          = array(
		'posts_per_page'      => $posts_to_show + count( $newspack_blocks_post_id ),
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'cat'                 => $categories,
		'tag_id'              => $tags,
		'author'              => $author,
		'ignore_sticky_posts' => true,
	);
	if ( $single_mode ) {
		$args['p'] = $single;
	} else {
		$args['cat']    = $categories;
		$args['author'] = $author;
		$args['author'] = $author;
	}
	$article_query = new WP_Query( $args );

	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes );

	$post_layout = isset( $attributes['postLayout'] ) ? $attributes['postLayout'] : 'columns';

	if ( 'carousel' === $post_layout ) {
		return newspack_blocks_homepage_articles_carousel( $attributes );
	}
	if ( 'grid' === $post_layout ) {
		$classes .= ' is-grid';
	}
	if ( 'grid' === $post_layout ) {
		$classes .= ' columns-' . $attributes['columns'];
	}
	if ( $attributes['showImage'] ) {
		$classes .= ' show-image';
	}
	if ( $attributes['showImage'] && isset( $attributes['mediaPosition'] ) ) {
		$classes .= ' image-align' . $attributes['mediaPosition'];
	}
	if ( isset( $attributes['typeScale'] ) ) {
		$classes .= ' type-scale' . $attributes['typeScale'];
	}
	if ( $attributes['showImage'] && isset( $attributes['imageScale'] ) ) {
		$classes .= ' image-scale' . $attributes['imageScale'];
	}
	if ( $attributes['showCaption'] ) {
		$classes .= ' show-caption';
	}
	if ( isset( $attributes['className'] ) ) {
		$classes .= ' ' . $attributes['className'];
	}

	if ( isset( $attributes['textColor'] ) ) {
		$classes .= ' has-text-color';
		if ( '' !== $attributes['textColor'] ) {
			$classes .= ' has-' . $attributes['textColor'] . '-color';
		}
	}

	$styles = '';

	if ( '' !== $attributes['customTextColor'] ) {
		$styles = 'color: ' . $attributes['customTextColor'] . ';';
	}

	$post_counter = 0;

	ob_start();

	if ( $article_query->have_posts() ) :
		?>
		<div class="<?php echo esc_attr( $classes ); ?>" style="<?php echo esc_attr( $styles ); ?>">

			<?php if ( '' !== $attributes['sectionHeader'] ) : ?>
				<h2 class="article-section-title">
					<span><?php echo wp_kses_post( $attributes['sectionHeader'] ); ?></span>
				</h2>
				<?php
			endif;
			while ( $article_query->have_posts() ) :
				$article_query->the_post();
				if ( isset( $newspack_blocks_post_id[ get_the_ID() ] ) || $post_counter >= $posts_to_show ) {
					continue;
				}
				$newspack_blocks_post_id[ get_the_ID() ] = true;
				$post_counter++;
				?>

				<article <?php echo has_post_thumbnail() ? 'class="post-has-image"' : ''; ?>>
					<?php if ( has_post_thumbnail() && $attributes['showImage'] ) : ?>

						<figure class="post-thumbnail">
							<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark">
								<?php the_post_thumbnail( 'large' ); ?>
							</a>

							<?php if ( $attributes['showCaption'] && '' !== get_the_post_thumbnail_caption() ) : ?>
								<figcaption><?php the_post_thumbnail_caption(); ?>
							<?php endif; ?>
						</figure><!-- .featured-image -->

					<?php endif; ?>

					<div class="entry-wrapper">

						<?php
						if ( '' === $attributes['sectionHeader'] ) {
							the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
						} else {
							the_title( '<h3 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h3>' );
						}
						?>

						<?php if ( $attributes['showExcerpt'] ) : ?>
							<?php the_excerpt(); ?>
						<?php endif; ?>

						<?php if ( $attributes['showAuthor'] || $attributes['showDate'] ) : ?>

							<div class="entry-meta">

								<?php if ( $attributes['showAuthor'] ) : ?>
									<?php
									if ( $attributes['showAvatar'] ) {
										echo get_avatar( get_the_author_meta( 'ID' ) );
									}
									?>
									<span class="byline">
										<?php
										printf(
											/* translators: %s: post author. */
											esc_html_x( 'by %s', 'post author', 'newspack-blocks' ),
											'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
										);
										?>
									</span><!-- .author-name -->
									<?php
								endif;

								if ( $attributes['showDate'] ) {
									$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';

									if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
										$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
									}

									$time_string = sprintf(
										$time_string,
										esc_attr( get_the_date( DATE_W3C ) ),
										esc_html( get_the_date() ),
										esc_attr( get_the_modified_date( DATE_W3C ) ),
										esc_html( get_the_modified_date() )
									);

									echo $time_string; // WPCS: XSS OK.
								}
								?>
							</div><!-- .entry-meta -->
						<?php endif; ?>
					</div><!-- .entry-wrapper -->
				</article>
				<?php
			endwhile;
			wp_reset_postdata();
			?>
		</div>
		<?php
		endif;
	$content = ob_get_clean();
	Newspack_Blocks::enqueue_view_assets( 'homepage-articles' );
	return $content;
}

/**
 * Registers the `newspack-blocks/homepage-articles` block on server.
 */
function newspack_blocks_register_homepage_articles() {
	register_block_type(
		'newspack-blocks/homepage-articles',
		array(
			'attributes'      => array(
				'className'       => array(
					'type' => 'string',
				),
				'showExcerpt'     => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showDate'        => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showImage'       => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showCaption'     => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'showAuthor'      => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showAvatar'      => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'content'         => array(
					'type' => 'string',
				),
				'postLayout'      => array(
					'type'    => 'string',
					'default' => 'list',
				),
				'columns'         => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'postsToShow'     => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'mediaPosition'   => array(
					'type'    => 'string',
					'default' => 'top',
				),
				'author'          => array(
					'type' => 'string',
				),
				'categories'      => array(
					'type' => 'string',
				),
				'tags'            => array(
					'type' => 'string',
				),
				'single'          => array(
					'type' => 'string',
				),
				'typeScale'       => array(
					'type'    => 'integer',
					'default' => 4,
				),
				'imageScale'      => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'sectionHeader'   => array(
					'type'    => 'string',
					'default' => '',
				),
				'singleMode'      => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'textColor'       => array(
					'type'    => 'string',
					'default' => '',
				),
				'customTextColor' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_homepage_articles',
		)
	);
}

/**
 * Renders the `newspack-blocks/author-bio` block as a carousel.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_homepage_articles_carousel( $attributes ) {
	if ( ! Newspack_Blocks::is_amp() ) {
		wp_enqueue_script(
			'amp-carousel',
			'https://cdn.ampproject.org/v0/amp-carousel-0.1.js',
			null,
			NEWSPACK_BLOCKS__VERSION,
			true
		);
	}
	static $newspack_blocks_carousel_id = 0;
	$newspack_blocks_carousel_id++;
	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes );

	$classes .= ' is-carousel';

	$author        = isset( $attributes['author'] ) ? $attributes['author'] : '';
	$categories    = isset( $attributes['categories'] ) ? $attributes['categories'] : '';
	$tags          = isset( $attributes['tags'] ) ? $attributes['tags'] : '';
	$single        = isset( $attributes['single'] ) ? $attributes['single'] : '';
	$posts_to_show = intval( $attributes['postsToShow'] );
	$single_mode   = intval( $attributes['singleMode'] );
	$args          = array(
		'posts_per_page'      => $posts_to_show,
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'cat'                 => $categories,
		'tag_id'              => $tags,
		'author'              => $author,
		'ignore_sticky_posts' => true,
	);
	if ( $single_mode ) {
		$args['p'] = $single;
	} else {
		$args['cat']    = $categories;
		$args['author'] = $author;
		$args['author'] = $author;
	}
	$article_query = new WP_Query( $args );

	$counter = 0;
	ob_start();

	if ( $article_query->have_posts() ) :
		while ( $article_query->have_posts() ) :
			$article_query->the_post();
			$counter++;
			?>

			<article <?php echo has_post_thumbnail() ? 'class="post-has-image"' : ''; ?>>
				<?php if ( has_post_thumbnail() && $attributes['showImage'] ) : ?>
					<figure class="post-thumbnail">
						<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark">
							<?php
								the_post_thumbnail(
									'large',
									array(
										'class'      => 'wp-block-jetpack-slideshow_image',
										'object-fit' => 'cover',
										'layout'     => 'fill',
									)
								);
							?>
						</a>
					</figure>
				<?php endif; ?>
				<div class="entry-wrapper">

					<?php
					if ( '' === $attributes['sectionHeader'] ) {
						the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
					} else {
						the_title( '<h3 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h3>' );
					}
					?>

					<?php if ( $attributes['showExcerpt'] ) : ?>
						<?php the_excerpt(); ?>
					<?php endif; ?>

					<?php if ( $attributes['showAuthor'] || $attributes['showDate'] ) : ?>

						<div class="entry-meta">

							<?php if ( $attributes['showAuthor'] ) : ?>
								<?php
								if ( $attributes['showAvatar'] ) {
									echo get_avatar( get_the_author_meta( 'ID' ) );
								}
								?>
								<span class="byline">
									<?php
									printf(
										/* translators: %s: post author. */
										esc_html_x( 'by %s', 'post author', 'newspack-blocks' ),
										'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
									);
									?>
								</span><!-- .author-name -->
								<?php
							endif;

							if ( $attributes['showDate'] ) {
								$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';

								if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
									$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
								}

								$time_string = sprintf(
									$time_string,
									esc_attr( get_the_date( DATE_W3C ) ),
									esc_html( get_the_date() ),
									esc_attr( get_the_modified_date( DATE_W3C ) ),
									esc_html( get_the_modified_date() )
								);

								echo $time_string; // WPCS: XSS OK.
							}
							?>
						</div><!-- .entry-meta -->
					<?php endif; ?>
				</div><!-- .entry-wrapper -->
			</article>
			<?php
		endwhile;
		endif;
		wp_reset_postdata();
	$slides = ob_get_clean();

	$buttons = array();
	for ( $x = 0; $x < $counter; $x++ ) {
		$aria_label = sprintf(
			/* translators: %d: Slide number. */
			__( 'Go to slide %d', 'newspack-blocks' ),
			absint( $x + 1 )
		);
		$buttons[] = sprintf(
			'<button option="%d" class="swiper-pagination-bullet" tabindex="0" role="button" aria-label="%s" %s></button>',
			absint( $x ),
			esc_attr( $aria_label ),
			0 === $x ? 'selected' : ''
		);
	}
	$selector = sprintf(
		'<amp-selector id="wp-block-jetpack-slideshow__amp-pagination__%1$d" class="wp-block-jetpack-slideshow_pagination swiper-pagination swiper-pagination-bullets amp-pagination" on="select:wp-block-jetpack-slideshow__amp-carousel__%1$d.goToSlide(index=event.targetOption)" layout="container">%2$s</amp-selector>',
		absint( $newspack_blocks_carousel_id ),
		implode( '', $buttons )
	);

	$delay    = 3;
	$autoplay = true;
	$carousel = sprintf(
		'<amp-carousel width="4" height="3" layout="responsive" type="slides" data-next-button-aria-label="%1$s" data-prev-button-aria-label="%2$s" controls loop %3$s id="wp-block-jetpack-slideshow__amp-carousel__%4$s" on="slideChange:wp-block-jetpack-slideshow__amp-pagination__%4$s.toggle(index=event.index, value=true)">%5$s</amp-carousel>',
		esc_attr__( 'Next Slide', 'newspack-blocks' ),
		esc_attr__( 'Previous Slide', 'newspack-blocks' ),
		$autoplay ? 'autoplay delay=' . esc_attr( $delay * 1000 ) : '',
		absint( $newspack_blocks_carousel_id ),
		$slides
	);
	Newspack_Blocks::enqueue_view_assets( 'homepage-articles' );
	return sprintf(
		'<div class="%1$s" id="wp-block-jetpack-slideshow__%2$d"><div class="wp-block-jetpack-slideshow_container swiper-container">%3$s%4$s%5$s</div></div>',
		esc_attr( $classes ),
		absint( $newspack_blocks_carousel_id ),
		$carousel,
		'',
		$selector
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );
