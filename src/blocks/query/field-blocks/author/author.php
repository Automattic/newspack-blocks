<?php
/**
 * Server-side rendering of the `newspack-blocks/author` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/author` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_author( $attributes ) {
	ob_start();
	?>
	<div class="author-byline">
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
	</div>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/author',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_author',
	)
);
