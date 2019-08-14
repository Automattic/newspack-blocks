<?php
/**
 * Server-side rendering of the `newspack-blocks/query` block.
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
function newspack_blocks_render_block_query( $attributes ) {
	global $newspack_blocks_post_id;
	if ( ! $newspack_blocks_post_id ) {
		$newspack_blocks_post_id = array();
	}
	$author        = isset( $attributes['author'] ) ? $attributes['author'] : '';
	$categories    = isset( $attributes['categories'] ) ? $attributes['categories'] : '';
	$posts_to_show = intval( $attributes['postsToShow'] );

	$post_attributes_template = $attributes['postAttributesTemplate'];

	$args = array(
		'posts_per_page'      => $posts_to_show + count( $newspack_blocks_post_id ),
		'post_status'         => 'publish',
		'suppress_filters'    => false,
		'cat'                 => $categories,
		'author'              => $author,
		'ignore_sticky_posts' => true,
	);

	$article_query = new WP_Query( $args );

	$classes = Newspack_Blocks::block_classes( 'query', $attributes );

	$elements = array();
	if ( $article_query->have_posts() ) {
		foreach ( $article_query->posts as $post ) {
			$block = array(
				'blockName'    => 'newspack-blocks/post',
				'attrs'        => array(
					'post' => $post,
				),
				'innerContent' => array(),
			);

			$elements[] = render_block( $block );
		}
	}
	Newspack_Blocks::enqueue_view_assets( 'query' );

	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<?php if ( $article_query->have_posts() ) : ?>
			<?php while ( $article_query->have_posts() ) : ?>
				<?php $article_query->the_post(); ?>
					<?php
						$attributes         = $post_attributes_template;
						$attributes['post'] = $article_query->post;
						echo wp_kses_post(
							render_block(
								array(
									'blockName'    => 'newspack-blocks/post',
									'attrs'        => $attributes,
									'innerContent' => array(),
								)
							)
						);
					?>
				<?php endwhile; ?>
			<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Registers the `newspack-blocks/homepage-articles` block on server.
 */
function newspack_blocks_register_query() {
	register_block_type(
		'newspack-blocks/query',
		array(
			'render_callback' => 'newspack_blocks_render_block_query',
			'attributes'      => array(
				'moreLink'               => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'postsToShow'            => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'author'                 => array(
					'type' => 'string',
				),
				'categories'             => array(
					'type' => 'string',
				),
				'postAttributesTemplate' => array(
					'type' => 'object',
				),
			),
		)
	);
}

add_action( 'init', 'newspack_blocks_register_query' );
