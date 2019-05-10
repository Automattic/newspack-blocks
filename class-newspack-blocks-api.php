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

		/* Add author avatar source */
		register_rest_field(
			'post',
			'newspack_author_avatar',
			array(
				'get_callback'    => array( 'Newspack_Blocks_API', 'newspack_blocks_get_avatar' ),
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
	 * @param Array  $object  The object info.
	 */
	public static function newspack_blocks_get_image_src( $object ) {
		if ( 0 === $object['featured_media'] ) {
			return;
		}
		$feat_img_array_thumbnail        = wp_get_attachment_image_src(
			$object['featured_media'],
			'thumbnail',
			false
		);
		$featured_image_set['thumbnail'] = $feat_img_array_thumbnail[0];

		$feat_img_array_medium        = wp_get_attachment_image_src(
			$object['featured_media'],
			'medium',
			false
		);
		$featured_image_set['medium'] = $feat_img_array_medium[0];

		$feat_img_array_large        = wp_get_attachment_image_src(
			$object['featured_media'],
			'large',
			false
		);
		$featured_image_set['large'] = $feat_img_array_large[0];

		$feat_img_array_full        = wp_get_attachment_image_src(
			$object['featured_media'],
			'full',
			false
		);
		$featured_image_set['full'] = $feat_img_array_full[0];

		return $featured_image_set;
	}

	/**
	 * Get author info for the rest field.
	 *
	 * @param Array  $object  The object info.
	 */
	public static function newspack_blocks_get_author_info( $object ) {
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
	 * @param Array  $object  The object info.
	 */
	public static function newspack_blocks_get_avatar( $object ) {
		/* Get the author avatar */
		$author_avatar = get_avatar( $object['author'], 48 );

		/* Return the author data */
		return $author_avatar;
	}

	/**
	 * Get first category for the rest field.
	 *
	 * @param Array  $object  The object info.
	 */
	public static function newspack_blocks_get_first_category( $object ) {
		$object['ID']    = '';
		$categories_list = get_the_category( $object['ID'] );
		$category_info   = '';

		if ( ! empty( $categories_list ) ) {
			$category_info = '<a href="' . get_category_link( $categories_list[0]->term_id ) . '">' . $categories_list[0]->name . '</a>';
		}

		return $category_info;
	}

}

add_action( 'rest_api_init', array( 'Newspack_Blocks_API', 'register_rest_fields' ) );
