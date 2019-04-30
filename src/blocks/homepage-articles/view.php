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
	$categories = isset( $attributes['categories'] ) ? $attributes['categories'] : '';

	$args    = array(
		'posts_per_page'   => $attributes['postsToShow'],
		'post_status'      => 'publish',
		'suppress_filters' => false,
		'cat'              => $categories,
	);
	$posts   = get_posts( $args );
	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes );

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' columns-' . $attributes['columns'];
	}
	if ( isset( $attributes['mediaPosition'] ) && 'top' !== $attributes['mediaPosition'] ) {
		$classes .= ' image-align' . $attributes['mediaPosition'];
	}
	if ( isset( $attributes['typeScale'] ) ) {
		$classes .= ' type-scale' . $attributes['typeScale'];
	}
	if ( isset( $attributes['imageScale'] ) ) {
		$classes .= ' image-scale' . $attributes['imageScale'];
	}

	if ( isset( $attributes['className'] ) ) {
		$classes .= ' ' . $attributes['className'];
	}

	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<?php
		foreach ( $posts as $post ) :
			setup_postdata( $post );
			$featured_image = get_the_post_thumbnail( $post, 'large' );
			?>
			<article <?php echo $featured_image ? 'class="has-featured-image"' : ''; ?>>
				<?php

				$image_allowed_tags = array(
					'img' => array(
						'alt'    => array(),
						'class'  => array(),
						'height' => array(),
						'src'    => array(),
						'width'  => array(),
					),
				);
				if ( $featured_image && $attributes['showImage'] ) :
					?>
					<div class="post-thumbnail">
						<?php
						echo wp_kses( $featured_image, $image_allowed_tags );
						?>
					</div><!-- .featured-image -->
					<?php
				endif;
				?>
				<div class="entry-wrapper">
					<?php
					$categories = get_the_category( $post );
					if ( ! empty( $categories ) && $attributes['showCategory'] ) :
						?>
						<div class="cat-links">
							<a href="<?php echo esc_url( get_category_link( $categories[0]->term_id ) ); ?>"><?php echo esc_html( $categories[0]->name ); ?></a>
						</div>
						<?php
					endif;
					?>
					<h2 class="entry-title">
						<a href="<?php echo esc_url( get_the_permalink( $post ) ); ?>"><?php echo esc_html( get_the_title( $post ) ); ?></a>
					</h2>
					<?php
					if ( $attributes['showExcerpt'] ) :
						echo '<p>' . esc_html( get_the_excerpt( $post ) ) . '</p>';
					endif;
					?>

					<?php if ( $attributes['showAuthor'] || $attributes['showDate'] ) : ?>

						<div class="article-meta">

							<?php if ( $attributes['showAuthor'] ) : ?>
								<span class="byline">
									<?php
									if ( $attributes['showAvatar'] ) {
										echo get_avatar( $post->post_author );
									}
									?>
									<span class="author-name">
										<?php
										printf(
											/* translators: %s: post author. */
											esc_html_x( 'by %s', 'post author', 'newspack-blocks' ),
											'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( $post->post_author ) ) . '">' . esc_html( get_the_author_meta( 'display_name', $post->post_author ) ) . '</a></span>'
										);
										?>
									</span><!-- .author-name -->
								</span><!-- .byline -->
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
						</div><!-- .article-meta -->
						<?php
					endif;
					?>
				</div><!-- .entry-wrapper -->
			</article>

		<?php endforeach; ?>
	</div>
	<?php
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
				'align'         => array(
					'type'    => 'string',
					'default' => '',
				),
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
				'showCategory'  => array(
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
			),
			'render_callback' => 'newspack_blocks_render_block_homepage_articles',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );
