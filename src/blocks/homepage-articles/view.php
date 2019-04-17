<?php
/**
 * Server-side rendering of the `newspack-blocks/author-bio` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/author-bio` block on server.
 *
 * @param array  $attributes The block attributes.
 * @param string $content The block content.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_homepage_articles( $attributes, $content ) {
	$args    = array(
		'posts_per_page'   => 3,
		'post_status'      => 'publish',
		'suppress_filters' => false,
	);
	$posts   = get_posts( $args );
	$classes = Newspack_Blocks::block_classes( 'homepage-articles', $attributes );

	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<?php
		foreach ( $posts as $post ) :
			setup_postdata( $post );
			?>
			<article>
				<?php
				$featured_image     = get_the_post_thumbnail( $post );
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

				<?php
				$categories = get_the_category( $post );
				if ( ! empty( $categories ) && $attributes['showCategory'] ) :
					echo '<a href="' . esc_url( get_category_link( $categories[0]->term_id ) ) . '">' . esc_html( $categories[0]->name ) . '</a>';
				endif;
				?>

				<h2>
					<a href="<?php echo esc_url( get_the_permalink( $post ) ); ?>">
						<?php echo esc_html( get_the_title( $post ) ); ?>
					</a>
				</h2>

				<?php
				if ( $attributes['showExcerpt'] ) :
					echo esc_html( get_the_excerpt( $post ) );
				endif;
				?>

				<?php if ( $attributes['showAuthor'] ) : ?>
					<div>
						<?php echo get_avatar( $post->post_author ); ?>

						<?php
						printf(
							/* translators: %s: post author. */
							esc_html__( 'by %s', 'newspack-blocks' ),
							// TODO: Add link.
							esc_html( get_the_author_meta( 'display_name', $post->post_author ) )
						);
						?>

					</div>
					<?php
				endif;
				?>

				<?php if ( $attributes['showDate'] ) : ?>
					<?php // TODO: Add last changed attribute. ?>
					<time>
						<?php echo esc_html( get_the_date( '', $post ) ); ?>
					</time>
					<?php
				endif;
				?>
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
				'align'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'showExcerpt'  => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showDate'     => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showImage'    => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showAuthor'   => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'showCategory' => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'content'      => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_homepage_articles',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_homepage_articles' );
