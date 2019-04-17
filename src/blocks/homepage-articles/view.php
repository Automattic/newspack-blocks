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

/**
 * Create API fields for additional info
 */
function newspack_blocks_register_rest_fields() {
	/* Add featured image source */
	register_rest_field(
		array( 'post', 'page' ),
		'featured_image_src',
		array(
			'get_callback'    => 'newspack_blocks_get_image_src',
			'update_callback' => null,
			'schema'          => null,
		)
	);

	/* Add author info source */
	register_rest_field(
		'post',
		'author_info',
		array(
			'get_callback'    => 'newspack_blocks_get_author_info',
			'update_callback' => null,
			'schema'          => null,
		)
	);

	/* Add author avatar source */
	register_rest_field(
		'post',
		'author_avatar',
		array(
			'get_callback'    => 'newspack_blocks_get_avatar',
			'update_callback' => null,
			'schema'          => null,
		)
	);

	/* Add first category source */
	register_rest_field(
		'post',
		'category_info',
		array(
			'get_callback'    => 'newspack_blocks_get_first_category',
			'update_callback' => null,
			'schema'          => null,
		)
	);
}
add_action( 'rest_api_init', 'newspack_blocks_register_rest_fields' );


/**
 * Get thumbnail featured image source for the rest field.
 *
 * @param String $object  The object type.
 * @param String $field_name  Name of the field to retrieve.
 * @param String $request  The current request object.
 */
function newspack_blocks_get_image_src( $object, $field_name, $request ) {
	$feat_img_array = wp_get_attachment_image_src(
		$object['featured_media'],
		'thumbnail',
		false
	);
	return $feat_img_array[0];
}

/**
 * Get author info for the rest field.
 *
 * @param String $object  The object type.
 * @param String $field_name  Name of the field to retrieve.
 * @param String $request  The current request object.
 */
function newspack_blocks_get_author_info( $object, $field_name, $request ) {
	/* Get the author name */
	$author_data['display_name'] = get_the_author_meta( 'display_name', $object['author'] );

	/* Get the author link */
	$author_data['author_link'] = get_author_posts_url( $object['author'] );

	/* Return the author data */
	return $author_data;
}

/**
 * Get author info for the rest field.
 *
 * @param String $object  The object type.
 * @param String $field_name  Name of the field to retrieve.
 * @param String $request  The current request object.
 */
function newspack_blocks_get_avatar( $object, $field_name, $request ) {
	/* Get the author avatar */
	$author_avatar = get_avatar( $object['author'], 48 );

	/* Return the author data */
	return $author_avatar;
}

/**
 * Get first category for the rest field.
 *
 * @param String $object  The object type.
 * @param String $field_name  Name of the field to retrieve.
 * @param String $request  The current request object.
 */
function newspack_blocks_get_first_category( $object, $field_name, $request ) {
	$object['ID']    = '';
	$categories_list = get_the_category( $object['ID'] );
	$category_info   = '';

	if ( ! empty( $categories_list ) ) {
		$category_info = '<a href="' . get_category_link( $categories_list[0]->term_id ) . '">' . $categories_list[0]->name . '</a>';
	}

	return $category_info;
}

