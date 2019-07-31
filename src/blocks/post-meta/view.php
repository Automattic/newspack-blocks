<?php
/**
 * Server-side rendering of the `newspack-blocks/author-bio` block.
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
function newspack_blocks_render_block_post_meta( $attributes ) {
	$classes = Newspack_Blocks::block_classes( 'post-meta', $attributes );

	ob_start();
	?>

		<div class="entry-meta">

			<?php

			// Author name and avatar.
			printf(
				/* translators: 1: Author avatar. 2: post author, only visible to screen readers. 3: author link. */
				'<span class="author-avatar">%1$s</span><span class="byline"><span>%2$s</span> <span class="author vcard"><a class="url fn n" href="%3$s">%4$s</a></span></span>',
				wp_kses(
					get_avatar( get_the_author_meta( 'ID' ) ),
					array(
						'img' => array(
							'alt'    => array(),
							'src'    => array(),
							'srcset' => array(),
							'class'  => array(),
							'width'  => array(),
							'height' => array(),
						),
					)
				),
				esc_html__( 'by', 'newspack-blocks' ),
				esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
				esc_html( get_the_author() )
			);

			$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
			if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
				$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
			}

			// Publish date.
			$time_string = sprintf(
				$time_string,
				esc_attr( get_the_date( DATE_W3C ) ),
				esc_html( get_the_date() ),
				esc_attr( get_the_modified_date( DATE_W3C ) ),
				esc_html( get_the_modified_date() )
			);

			printf(
				'<span class="posted-on">%1$s</span>',
				wp_kses(
					$time_string,
					array(
						'time' => array(
							'class'    => array(),
							'datetime' => array(),
						),
					)
				)
			);

			?>
		</div><!-- .entry-meta -->

		<?php
		$content = ob_get_clean();
		Newspack_Blocks::enqueue_view_assets( 'post-meta' );
		return $content;
}

/**
 * Registers the `newspack-blocks/post-meta` block on server.
 */
function newspack_blocks_register_post_meta() {
	register_block_type(
		'newspack-blocks/post-meta',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_post_meta',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_post_meta' );
