<?php
/**
 * Register Newspack Blocks rest fields
 *
 * @package Newspack_Blocks
 */

/**
 * `Newspack_Blocks_API` is a wrapper for `register_rest_fields()`
 */
class Newspack_Blocks_API {

	/**
	 * Register Newspack REST fields.
	 */
	public static function register_rest_fields() {
		register_rest_field(
			array( 'post', 'page' ),
			'newspack_featured_image_src',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_image_src' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		register_rest_field(
			array( 'post', 'page' ),
			'newspack_featured_image_caption',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_image_caption' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		/* Add author info source */
		register_rest_field(
			'post',
			'newspack_author_info',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_author_info' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);

		/* Add first category source */
		register_rest_field(
			'post',
			'newspack_category_info',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_first_category' ),
				'update_callback' => null,
				'schema'          => null,
			)
		);
	}

	/**
	 * Get thumbnail featured image source for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_image_src( $object ) {
		if ( 0 === $object['featured_media'] ) {
			return;
		}

		// Landscape image.
		$landscape_large  = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-landscape-large' );
		$landscape_medium = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-landscape-medium' );
		$landscape_small  = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-landscape-small' );
		$landscape_size   = 'newspack-article-block-landscape-tiny';

		if ( 400 === $landscape_small[1] && 300 === $landscape_small[2] ) {
			$landscape_size = 'newspack-article-block-landscape-small';
		}

		if ( 800 === $landscape_medium[1] && 600 === $landscape_medium[2] ) {
			$landscape_size = 'newspack-article-block-landscape-medium';
		}

		if ( 1200 === $landscape_large[1] && 900 === $landscape_large[2] ) {
			$landscape_size = 'newspack-article-block-landscape-large';
		}

		$feat_img_array_landscape        = wp_get_attachment_image_src(
			$object['featured_media'],
			$landscape_size,
			false
		);
		$featured_image_set['landscape'] = $feat_img_array_landscape[0];

		// Portrait image.
		$portrait_large  = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-portrait-large' );
		$portrait_medium = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-portrait-medium' );
		$portrait_small  = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-portrait-small' );
		$portrait_size   = 'newspack-article-block-portrait-tiny';

		if ( 300 === $portrait_small[1] && 400 === $portrait_small[2] ) {
			$portrait_size = 'newspack-article-block-portrait-small';
		}

		if ( 600 === $portrait_medium[1] && 800 === $portrait_medium[2] ) {
			$portrait_size = 'newspack-article-block-portrait-medium';
		}

		if ( 900 === $portrait_large[1] && 1200 === $portrait_large[2] ) {
			$portrait_size = 'newspack-article-block-portrait-large';
		}

		$feat_img_array_portrait        = wp_get_attachment_image_src(
			$object['featured_media'],
			$portrait_size,
			false
		);
		$featured_image_set['portrait'] = $feat_img_array_portrait[0];

		// Square image.
		$square_large  = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-square-large' );
		$square_medium = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-square-medium' );
		$square_small  = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ), 'newspack-article-block-square-small' );
		$square_size   = 'newspack-article-block-square-tiny';

		if ( 400 === $square_small[1] && 400 === $square_small[2] ) {
			$square_size = 'newspack-article-block-square-small';
		}

		if ( 800 === $square_medium[1] && 800 === $square_medium[2] ) {
			$square_size = 'newspack-article-block-square-medium';
		}

		if ( 1200 === $square_large[1] && 1200 === $square_large[2] ) {
			$square_size = 'newspack-article-block-square-large';
		}

		$feat_img_array_square        = wp_get_attachment_image_src(
			$object['featured_media'],
			$square_size,
			false
		);
		$featured_image_set['square'] = $feat_img_array_square[0];

		return $featured_image_set;
	}

	/**
	 * Get thumbnail featured image captions for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_image_caption( $object ) {
		return (int) $object['featured_media'] > 0 ? trim( wp_get_attachment_caption( $object['featured_media'] ) ) : null;
	}

	/**
	 * Get author info for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_author_info( $object ) {
		$author_data = array(
			/* Get the author name */
			'display_name' => get_the_author_meta( 'display_name', $object['author'] ),
			/* Get the author link */
			'author_link'  => get_author_posts_url( $object['author'] ),
			/* Get the author avatar */
			'avatar'       => get_avatar( $object['author'], 48 ),
		);

		/* Return the author data */
		return $author_data;
	}

	/**
	 * Get first category for the rest field.
	 *
	 * @param Array $object  The object info.
	 */
	public static function newspack_blocks_get_first_category( $object ) {
		$categories_list = get_the_category( $object['id'] );
		$category_info   = '';

		if ( ! empty( $categories_list ) ) {
			$category_info = '<a href="' . get_category_link( $categories_list[0]->term_id ) . '">' . $categories_list[0]->name . '</a>';
		}

		return $category_info;
	}
}

add_action( 'rest_api_init', array( 'Newspack_Blocks_API', 'register_rest_fields' ) );
