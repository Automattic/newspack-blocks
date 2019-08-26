<?php
/**
 * Server-side rendering of the `newspack-blocks/post-bep` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/post-bep` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_post_bep( $attributes ) {
	$post = ! empty( $attributes['post'] ) ? $attributes['post'] : array();

	$classes = Newspack_Blocks::block_classes( 'post', $attributes );
	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<article>
			<?php if ( $attributes['showImage'] && has_post_thumbnail() ) : ?>
				<div class="post-thumbnail">
					<?php the_post_thumbnail( 'large' ); ?>
				</div>
			<?php endif; ?>
			<div class="entry-wrapper">
				<?php the_title( '<h3 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h3>' ); ?>
			</div>
		</article>
	</div>
	<?php
	Newspack_Blocks::enqueue_view_assets( 'post-bep' );
	return ob_get_clean();
}

/**
 * Registers the `newspack-blocks/post-bep` block on server.
 */
function newspack_blocks_register_post_bep() {
	register_block_type(
		'newspack-blocks/post',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
				'showImage' => array(
					'type' => 'boolen',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_post_bep',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_post_bep' );
