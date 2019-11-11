<?php
/**
 * Server-side rendering of the `newspack-blocks/tags` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/tags` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_tags( $attributes ) {
	ob_start();
	?>
	<div class="article-section-tags">
		<?php
		/* translators: used between list items, there is a space after the comma. */
		$tags_list = get_the_tag_list( '', '<span class="comma">' . esc_html__( ', ', 'newspack-blocks' ) . '</span>' );
		if ( $tags_list ) {
			printf(
				/* translators: 1: posted in label, only visible to screen readers. 2: list of tags. */
				'<span class="tags-links"><span class="screen-reader-text">%1$s</span>%2$s</span>',
				esc_html__( 'Tags:', 'newspack-blocks' ),
				$tags_list
			); // WPCS: XSS OK.
		}
		?>
	</div>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/tags',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_tags',
	)
);
