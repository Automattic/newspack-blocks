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
	$categories    = isset( $attributes['categories'] ) ? $attributes['categories'] : '';
	$args          = array(
		'posts_per_page'   => $attributes['postsToShow'],
		'post_status'      => 'publish',
		'suppress_filters' => false,
		'cat'              => $categories,
	);
	$article_query = new WP_Query( $args );

	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes );

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' columns-' . $attributes['columns'];
	}
	if ( $attributes['showImage'] && isset( $attributes['mediaPosition'] ) && 'top' !== $attributes['mediaPosition'] ) {
		$classes .= ' image-align' . $attributes['mediaPosition'];
	}
	if ( isset( $attributes['typeScale'] ) ) {
		$classes .= ' type-scale' . $attributes['typeScale'];
	}
	if ( $attributes['showImage'] && isset( $attributes['imageScale'] ) ) {
		$classes .= ' image-scale' . $attributes['imageScale'];
	}
	if ( isset( $attributes['className'] ) ) {
		$classes .= ' ' . $attributes['className'];
	}

	ob_start();

	if ( $article_query->have_posts() ) :
		?>
		<div class="<?php echo esc_attr( $classes ); ?>">

			<?php if ( '' !== $attributes['sectionHeader'] ) : ?>
				<div class="article-section-title">
					<span><?php echo wp_kses_post( $attributes['sectionHeader'] ); ?></span>
				</div>
			<?php
			endif;
			while ( $article_query->have_posts() ) :
				$article_query->the_post();
				?>
				<article <?php echo has_post_thumbnail() ? 'class="article-has-image"' : ''; ?>>
					<?php if ( has_post_thumbnail() && $attributes['showImage'] ) : ?>
						<div class="article-thumbnail">
							<?php the_post_thumbnail( 'large' ); ?>
						</div><!-- .featured-image -->
					<?php endif; ?>

					<div class="article-wrapper">

						<?php the_title( '<h2 class="article-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>

						<?php if ( $attributes['showExcerpt'] ) : ?>
							<p><?php the_excerpt(); ?></p>
						<?php endif; ?>

						<?php if ( $attributes['showAuthor'] || $attributes['showDate'] ) : ?>

							<div class="article-meta">

								<?php if ( $attributes['showAuthor'] ) : ?>
									<span class="article-byline">
										<?php
										if ( $attributes['showAvatar'] ) {
											echo get_avatar( get_the_author_meta( 'ID' ) );
										}
										?>
										<span class="author-name">
											<?php
											printf(
												/* translators: %s: post author. */
												esc_html_x( 'by %s', 'post author', 'newspack-blocks' ),
												'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
											);
											?>
										</span><!-- .author-name -->
									</span><!-- .article-byline -->
									<?php
								endif;

								if ( $attributes['showDate'] ) {
									$time_string = '<time class="article-date published updated" datetime="%1$s">%2$s</time>';

									if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
										$time_string = '<time class="article-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
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
							</div><!-- .article-meta -->
						<?php endif; ?>
					</div><!-- .article-wrapper -->
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
				'className'     => array(
					'type' => 'string',
				),
				'showExcerpt'   => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showDate'      => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showImage'     => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showAuthor'    => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showAvatar'    => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'content'       => array(
					'type' => 'string',
				),
				'postLayout'    => array(
					'type'    => 'string',
					'default' => 'list',
				),
				'columns'       => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'postsToShow'   => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'mediaPosition' => array(
					'type'    => 'string',
					'default' => 'top',
				),
				'categories'    => array(
					'type' => 'string',
				),
				'typeScale'     => array(
					'type'    => 'integer',
					'default' => 4,
				),
				'imageScale'    => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'sectionHeader' => array(
					'type'    => 'string',
					'default' => '',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_homepage_articles',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );
