<?php
/**
 * Server-side rendering of the `newspack-blocks/categories` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/categories` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_categories( $attributes ) {
	ob_start();
	?>
	<div class="article-section-categories">
		<?php
		/* translators: used between list items, there is a space after the comma. */
		$categories_list = get_the_category_list( __( ', ', 'newspack-blocks' ) );
		if ( $categories_list ) {
			printf(
				/* translators: 1: posted in label, only visible to screen readers. 2: list of categories. */
				'<span class="cat-links"><span class="screen-reader-text">%1$s</span>%2$s</span>',
				esc_html__( 'Posted in', 'newspack-blocks' ),
				esc_html( $categories_list )
			);
		}
		?>
	</div>
	<?php
	return ob_get_clean();
}

register_block_type(
	'newspack-blocks/post-categories',
	array(
		'attributes'      => array(
			'className' => array(
				'type' => 'string',
			),
		),
		'render_callback' => 'newspack_blocks_render_block_categories',
	)
);
