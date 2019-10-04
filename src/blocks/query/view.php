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
	$blocks = ! empty( $attributes['blocks'] ) ? $attributes['blocks'] : array();
	$args = newspack_blocks_criteria_to_args( $attributes['criteria'] );

	$query = new WP_Query( $args );

	$classes = Newspack_Blocks::block_classes( 'query', $attributes );
	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<?php if ( $query->have_posts() ) : ?>
			<?php while ( $query->have_posts() ) : ?>
				<?php
					$query->the_post();

				foreach ( $blocks as $block ) {
					$block_data = array(
						'blockName'    => $block['name'],
						'attrs'        => $block['attributes'],
						'innerContent' => array(),
					);
					echo wp_kses_post( render_block( $block_data ) );
				}
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
		'offset'              => ! empty( $criteria['offset'] ) ? intval( $criteria['offset'] ) : 0,
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
	if ( ! empty( $criteria['categories_exclude'] ) ) {
		$args['category__not_in'] = array( intval( $criteria['categories_exclude'] ) );
	}
	if ( ! empty( $criteria['tags'] ) ) {
		$args['tag_id'] = intval( $criteria['tags'] );
	}
	if ( ! empty( $criteria['tags_exclude'] ) ) {
		$args['tag__not_in'] = array( intval( $criteria['tags_exclude'] ) );
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
				'className' => array(
					'type' => 'string',
				),
				'criteria'  => array(
					'type'    => 'object',
					'default' => array(
						'per_page' => 3,
					),
				),
			),
			'render_callback' => 'newspack_blocks_render_block_query',
		)
	);

	$basePath = dirname( __FILE__ );

	include_once( $basePath . '/field-blocks/author/author.php' );
	include_once( $basePath . '/field-blocks/categories/categories.php' );
	include_once( $basePath . '/field-blocks/date/date.php' );
	include_once( $basePath . '/field-blocks/excerpt/excerpt.php' );
	include_once( $basePath . '/field-blocks/featured-image/featured-image.php' );
	include_once( $basePath . '/field-blocks/tags/tags.php' );
	include_once( $basePath . '/field-blocks/title/title.php' );
}

add_action( 'init', 'newspack_blocks_register_query' );
