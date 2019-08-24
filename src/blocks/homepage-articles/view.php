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

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' is-grid';
	}
	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$classes .= ' columns-' . $attributes['columns'];
	}
	if ( $attributes['showImage'] ) {
		$classes .= ' show-image';
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
	$post_counter = 0;

	ob_start();

	if ( $article_query->have_posts() ) :
		?>
		<div class="<?php echo esc_attr( $classes ); ?>">

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
			?>
			<?php wp_reset_postdata(); ?>
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
				'showCaption'   => array(
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
				'author'        => array(
					'type' => 'string',
				),
				'categories'    => array(
					'type' => 'string',
				),
				'tags'          => array(
					'type' => 'string',
				),
				'single'        => array(
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
				'singleMode'    => array(
					'type'    => 'boolean',
					'default' => false,
				),
			),
			'render_callback' => 'newspack_blocks_render_block_homepage_articles',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );
