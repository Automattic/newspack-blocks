<?php
/**
 * Server-side rendering of the `newspack-blocks/post` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/post` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_post( $attributes ) {
	$post = isset( $attributes['post'] ) ? $attributes['post'] : array();

	$classes = Newspack_Blocks::block_classes( 'post', $attributes );

	if ( $attributes['showImage'] && isset( $attributes['mediaPosition'] ) && 'top' !== $attributes['mediaPosition'] ) {
		$classes .= ' image-align' . $attributes['mediaPosition'];
	}
	if ( isset( $attributes['typeScale'] ) ) {
		$classes .= ' type-scale' . $attributes['typeScale'];
	}
	if ( $attributes['showImage'] && isset( $attributes['imageScale'] ) ) {
		$classes .= ' image-scale' . $attributes['imageScale'];
	}

	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<article <?php echo has_post_thumbnail() ? 'class="post-has-image"' : ''; ?>>
			<?php if ( has_post_thumbnail() && $attributes['showImage'] ) : ?>
				<div class="post-thumbnail">
					<?php the_post_thumbnail( 'large' ); ?>
				</div><!-- .featured-image -->
			<?php endif; ?>

			<div class="entry-wrapper">

				<?php the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>

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
	</div>
	<?php
	Newspack_Blocks::enqueue_view_assets( 'post' );
	return ob_get_clean();
}

/**
 * Registers the `newspack-blocks/post` block on server.
 */
function newspack_blocks_register_post() {
	register_block_type(
		'newspack-blocks/post',
		array(
			'render_callback' => 'newspack_blocks_render_block_post',
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
				'postLayout'    => array(
					'type'    => 'string',
					'default' => 'list',
				),
				'mediaPosition' => array(
					'type'    => 'string',
					'default' => 'top',
				),
				'typeScale'     => array(
					'type'    => 'integer',
					'default' => 4,
				),
				'imageScale'    => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'moreLink'      => array(
					'type'    => 'boolean',
					'default' => false,
				),
			),
		)
	);
}

add_action( 'init', 'newspack_blocks_register_post' );
