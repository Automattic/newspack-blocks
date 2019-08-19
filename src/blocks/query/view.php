<?php
/**
 * Server-side rendering of the `newspack-blocks/query` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/query` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_query( $attributes ) {
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
 * Convert criteria object into args ready for use in WP_Query
 *
 * @param array $criteria A criteria object.
 *
 * @return array Return an array of args.
 */
function newspack_blocks_criteria_to_args( $criteria ) {
	$args = array(
		'posts_per_page'      => ! empty( $criteria['per_page'] ) ? intval( $criteria['per_page'] ) : 3,
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'ignore_sticky_posts' => true,
	);
	if ( ! empty( $criteria['author'] ) ) {
		$args['author'] = $criteria['author'];
	}
	if ( ! empty( $criteria['categories'] ) ) {
		$args['cat'] = intval( $criteria['categories'] );
	}
	if ( ! empty( $criteria['tags'] ) ) {
		$args['tag_id'] = intval( $criteria['tags'] );
	}
	if ( ! empty( $criteria['search'] ) ) {
		$args['s'] = sanitize_text_field( $criteria['search'] );
	}
	return $args;
}

/**
 * Registers the `newspack-blocks/query` block on server.
 */
function newspack_blocks_register_query() {
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
			'render_callback' => 'newspack_blocks_render_block_query',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_query' );
