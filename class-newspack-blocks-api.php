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
		$feat_img_array_landscape_large        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-landscape-large',
			false
		);
		$featured_image_set['landscape_large'] = $feat_img_array_landscape_large[0];

		$feat_img_array_landscape_medium        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-landscape-medium',
			false
		);
		$featured_image_set['landscape_medium'] = $feat_img_array_landscape_medium[0];

		$feat_img_array_landscape_small        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-landscape-small',
			false
		);
		$featured_image_set['landscape_small'] = $feat_img_array_landscape_small[0];

		$feat_img_array_landscape_tiny        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-landscape-tiny',
			false
		);
		$featured_image_set['landscape_tiny'] = $feat_img_array_landscape_tiny[0];

		// Portrait image.
		$feat_img_array_portrait_large        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-portrait-large',
			false
		);
		$featured_image_set['portrait_large'] = $feat_img_array_portrait_large[0];

		$feat_img_array_portrait_medium        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-portrait-medium',
			false
		);
		$featured_image_set['portrait_medium'] = $feat_img_array_portrait_medium[0];

		$feat_img_array_portrait_small        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-portrait-small',
			false
		);
		$featured_image_set['portrait_small'] = $feat_img_array_portrait_small[0];

		$feat_img_array_portrait_tiny        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-portrait-tiny',
			false
		);
		$featured_image_set['portrait_tiny'] = $feat_img_array_portrait_tiny[0];

		// Square image.
		$feat_img_array_square_large        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-square-large',
			false
		);
		$featured_image_set['square_large'] = $feat_img_array_square_large[0];

		$feat_img_array_square_medium        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-square-medium',
			false
		);
		$featured_image_set['square_medium'] = $feat_img_array_square_medium[0];

		$feat_img_array_square_small        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-square-small',
			false
		);
		$featured_image_set['square_small'] = $feat_img_array_square_small[0];

		$feat_img_array_square_tiny        = wp_get_attachment_image_src(
			$object['featured_media'],
			'newspack-article-block-square-tiny',
			false
		);
		$featured_image_set['square_tiny'] = $feat_img_array_square_tiny[0];

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
