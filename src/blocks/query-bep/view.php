<?php
/**
 * Server-side rendering of the `newspack-blocks/query-bep` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/query-bep` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_query_bep( $attributes ) {
	$inner_blocks_attributes = $attributes['innerBlockAttributes'];

	$args = newspack_blocks_criteria_to_args( $attributes['criteria'] );

	$query = new WP_Query( $args );

	$classes = Newspack_Blocks::block_classes( 'query', $attributes );

	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<?php if ( $query->have_posts() ) : ?>
			<?php while ( $query->have_posts() ) : ?>
				<?php $query->the_post(); ?>
					<?php
						$post_attr         = $inner_blocks_attributes;
						$post_attr['post'] = $query->post;
						echo wp_kses_post(
							render_block(
								array(
									'blockName'    => 'newspack-blocks/post',
									'attrs'        => $post_attr,
									'innerContent' => array(),
								)
							)
						);
					?>
				<?php endwhile; ?>
			<?php endif; ?>
	</div>
	<?php
	Newspack_Blocks::enqueue_view_assets( 'query' );
	return ob_get_clean();
}

/**
 * Registers the `newspack-blocks/query-bep` block on server.
 */
function newspack_blocks_register_query_bep() {
	register_block_type(
		'newspack-blocks/query',
		array(
			'attributes'      => array(
				'className'            => array(
					'type' => 'string',
				),
				'criteria'             => array(
					'type' => 'object',
				),
				'innerBlockAttributes' => array(
					'type' => 'object',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_query_bep',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_query_bep' );
