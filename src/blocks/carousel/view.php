<?php
/**
 * Server-side rendering of the `newspack-blocks/carousel` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/carousel` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_carousel( $attributes ) {
	if ( ! Newspack_Blocks::is_amp() ) {
		wp_enqueue_script(
			'amp-carousel',
			'https://cdn.ampproject.org/v0/amp-carousel-0.1.js',
			null,
			NEWSPACK_BLOCKS__VERSION,
			true
		);
		wp_enqueue_script(
			'amp-selector',
			'https://cdn.ampproject.org/v0/amp-selector-0.1.js',
			null,
			NEWSPACK_BLOCKS__VERSION,
			true
		);
	}
	static $newspack_blocks_carousel_id = 0;
	$newspack_blocks_carousel_id++;
	$classes       = Newspack_Blocks::block_classes( 'carousel', $attributes );
	$author        = isset( $attributes['author'] ) ? $attributes['author'] : '';
	$categories    = isset( $attributes['categories'] ) ? $attributes['categories'] : '';
	$tags          = isset( $attributes['tags'] ) ? $attributes['tags'] : '';
	$posts_to_show = intval( $attributes['postsToShow'] );
	$args          = array(
		'posts_per_page'      => $posts_to_show,
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'cat'                 => $categories,
		'tag_id'              => $tags,
		'author'              => $author,
		'ignore_sticky_posts' => true,
		'cat'                 => $categories,
		'author'              => $author,
	);
	$article_query = new WP_Query( $args );
	$counter       = 0;
	ob_start();
	if ( $article_query->have_posts() ) :
		while ( $article_query->have_posts() ) :
			$article_query->the_post();
			if ( ! has_post_thumbnail() ) {
				continue;
			}
			$counter++;
			?>

			<article <?php echo has_post_thumbnail() ? 'class="post-has-image"' : ''; ?>>
				<figure class="post-thumbnail">
					<a href="<?php echo esc_url( get_permalink() ); ?>" rel="bookmark">
						<?php
							the_post_thumbnail(
								'large',
								array(
									'object-fit' => 'cover',
									'layout'     => 'fill',
								)
							);
						?>
					</a>
				</figure>
				<div class="entry-wrapper">

					<?php
						the_title( '<h3 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h3>' );
					?>

					<div class="entry-meta">

							<?php echo get_avatar( get_the_author_meta( 'ID' ) ); ?>
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
							?>
					</div><!-- .entry-meta -->
				</div><!-- .entry-wrapper -->
			</article>
			<?php
		endwhile;
		endif;
		wp_reset_postdata();
	$slides  = ob_get_clean();
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
		'<amp-selector id="wp-block-newspack-carousel__amp-pagination__%1$d" class="swiper-pagination-bullets amp-pagination" on="select:wp-block-newspack-carousel__amp-carousel__%1$d.goToSlide(index=event.targetOption)" layout="container">%2$s</amp-selector>',
		absint( $newspack_blocks_carousel_id ),
		implode( '', $buttons )
	);
	$delay    = 3;
	$autoplay = true;
	$carousel = sprintf(
		'<amp-carousel width="4" height="3" layout="responsive" type="slides" data-next-button-aria-label="%1$s" data-prev-button-aria-label="%2$s" controls loop %3$s id="wp-block-newspack-carousel__amp-carousel__%4$s" on="slideChange:wp-block-newspack-carousel__amp-pagination__%4$s.toggle(index=event.index, value=true)">%5$s</amp-carousel>',
		esc_attr__( 'Next Slide', 'newspack-blocks' ),
		esc_attr__( 'Previous Slide', 'newspack-blocks' ),
		$autoplay ? 'autoplay delay=' . esc_attr( $delay * 1000 ) : '',
		absint( $newspack_blocks_carousel_id ),
		$slides
	);
	Newspack_Blocks::enqueue_view_assets( 'carousel' );
	return sprintf(
		'<div class="%1$s" id="wp-block-newspack-carousel__%2$d">%3$s%4$s%5$s</div>',
		esc_attr( $classes ),
		absint( $newspack_blocks_carousel_id ),
		$carousel,
		'',
		$selector
	);
}

/**
 * Registers the `newspack-blocks/carousel` block on server.
 */
function newspack_blocks_register_carousel() {
	register_block_type(
		'newspack-blocks/carousel',
		array(
			'attributes'      => array(
				'className'   => array(
					'type' => 'string',
				),
				'postsToShow' => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'author'      => array(
					'type' => 'string',
				),
				'categories'  => array(
					'type' => 'string',
				),
				'tags'        => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_carousel',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_carousel' );
