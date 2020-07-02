<?php
/**
 * Newspack blocks functionality
 *
 * @package Newspack_Blocks
 */

/**
 * Newspack blocks functionality
 */
class Newspack_Blocks {
	/**
	 * Add hooks and filters.
	 */
	public static function init() {
		add_action( 'after_setup_theme', [ __CLASS__, 'add_image_sizes' ] );
	}

	/**
	 * Gather dependencies and paths needed for script enqueuing.
	 *
	 * @param string $script_path Path to the script relative to plugin root.
	 *
	 * @return array Associative array including dependency array, version, and web path to the script. Returns false if script doesn't exist.
	 */
	public static function script_enqueue_helper( $script_path ) {
		$local_path = NEWSPACK_BLOCKS__PLUGIN_DIR . $script_path;
		if ( ! file_exists( $local_path ) ) {
			return false;
		}

		$path_info   = pathinfo( $local_path );
		$asset_path  = $path_info['dirname'] . '/' . $path_info['filename'] . '.asset.php';
		$script_data = file_exists( $asset_path )
			? require $asset_path
			: array(
				'dependencies' => array(),
				'version'      => filemtime( $local_path ),
			);

		$script_data['script_path'] = plugins_url( $script_path, __FILE__ );
		return $script_data;
	}

	/**
	 * Enqueue block scripts and styles for editor.
	 */
	public static function enqueue_block_editor_assets() {
		$script_data = static::script_enqueue_helper( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.js' );

		if ( $script_data ) {
			wp_enqueue_script(
				'newspack-blocks-editor',
				$script_data['script_path'],
				$script_data['dependencies'],
				$script_data['version'],
				true
			);
			wp_localize_script(
				'newspack-blocks-editor',
				'newspack_blocks_data',
				[
					'patterns' => self::get_patterns_for_post_type( get_post_type() ),
				]
			);

			wp_set_script_translations(
				'newspack-blocks-editor',
				'newspack-blocks',
				plugin_dir_path( __FILE__ ) . 'languages'
			);
		}

		$editor_style = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.css', __FILE__ );

		wp_enqueue_style(
			'newspack-blocks-editor',
			$editor_style,
			array(),
			NEWSPACK_BLOCKS__VERSION
		);
	}

	/**
	 * Enqueue block scripts and styles for view.
	 */
	public static function manage_view_scripts() {
		if ( is_admin() ) {
			// In editor environment, do nothing.
			return;
		}
		$src_directory  = NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/';
		$dist_directory = NEWSPACK_BLOCKS__PLUGIN_DIR . 'dist/';
		$iterator       = new DirectoryIterator( $src_directory );
		foreach ( $iterator as $block_directory ) {
			if ( ! $block_directory->isDir() || $block_directory->isDot() ) {
				continue;
			}
			$type = $block_directory->getFilename();

			/* If view.php is found, include it and use for block rendering. */
			$view_php_path = $src_directory . $type . '/view.php';
			if ( file_exists( $view_php_path ) ) {
				include_once $view_php_path;
				continue;
			}

			/* If view.php is missing but view Javascript file is found, do generic view asset loading. */
			$view_js_path = $dist_directory . $type . '/view.js';
			if ( file_exists( $view_js_path ) ) {
				register_block_type(
					"newspack-blocks/{$type}",
					array(
						'render_callback' => function( $attributes, $content ) use ( $type ) {
							Newspack_Blocks::enqueue_view_assets( $type );
							return $content;
						},
					)
				);
			}
		}
	}

	/**
	 * Enqueue block styles stylesheet.
	 */
	public static function enqueue_block_styles_assets() {
		$style_path = NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'block_styles' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		if ( file_exists( NEWSPACK_BLOCKS__PLUGIN_DIR . $style_path ) ) {
			wp_enqueue_style(
				'newspack-blocks-block-styles-stylesheet',
				plugins_url( $style_path, __FILE__ ),
				array(),
				NEWSPACK_BLOCKS__VERSION
			);
		}
	}

	/**
	 * Enqueue view scripts and styles for a single block.
	 *
	 * @param string $type The block's type.
	 */
	public static function enqueue_view_assets( $type ) {
		$style_path = apply_filters(
			'newspack_blocks_enqueue_view_assets',
			NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . $type . '/view' . ( is_rtl() ? '.rtl' : '' ) . '.css',
			$type,
			is_rtl()
		);

		if ( file_exists( NEWSPACK_BLOCKS__PLUGIN_DIR . $style_path ) ) {
			wp_enqueue_style(
				"newspack-blocks-{$type}",
				plugins_url( $style_path, __FILE__ ),
				array(),
				NEWSPACK_BLOCKS__VERSION
			);
		}
		if ( static::is_amp() ) {
			return;
		}
		$script_data = static::script_enqueue_helper( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . $type . '/view.js' );
		if ( $script_data ) {
			wp_enqueue_script(
				"newspack-blocks-{$type}",
				$script_data['script_path'],
				$script_data['dependencies'],
				$script_data['version'],
				true
			);
		}
	}

	/**
	 * Utility to assemble the class for a server-side rendered block.
	 *
	 * @param string $type The block type.
	 * @param array  $attributes Block attributes.
	 * @param array  $extra Additional classes to be added to the class list.
	 *
	 * @return string Class list separated by spaces.
	 */
	public static function block_classes( $type, $attributes = array(), $extra = array() ) {
		$classes = [ "wp-block-newspack-blocks-{$type}" ];

		if ( ! empty( $attributes['align'] ) ) {
			$classes[] = 'align' . $attributes['align'];
		}
		if ( isset( $attributes['className'] ) ) {
			array_push( $classes, $attributes['className'] );
		}
		if ( is_array( $extra ) && ! empty( $extra ) ) {
			$classes = array_merge( $classes, $extra );
		}

		return implode( ' ', $classes );
	}

	/**
	 * Checks whether the current view is served in AMP context.
	 *
	 * @return bool True if AMP, false otherwise.
	 */
	public static function is_amp() {
		return ! is_admin() && function_exists( 'is_amp_endpoint' ) && is_amp_endpoint();
	}

	/**
	 * Registers image sizes required for Newspack Blocks.
	 */
	public static function add_image_sizes() {
		add_image_size( 'newspack-article-block-uncropped', 1200, 9999, true );
	}

	/**
	 * Gets information about the current featured image.
	 *
	 * @param string $post_id Post ID.
	 * @return array Array of image url, width, height, alt text and srcset.
	 */
	public static function get_thumbnail_info( $post_id ) {
		// Get the image.
		$thumb_id = get_post_thumbnail_id( $post_id );

		// Get the image information based on the thumbnail ID.
		$img_src  = wp_get_attachment_image_src( $thumb_id, 'full' );
		$img_meta = wp_get_attachment_metadata( $thumb_id, true ); // Unlike wp_get_attachment_image_src(), size from wp_get_attachment_metadata() is not affected by Photon.

		// Store URL, width, height, alt and srcset in an array.
		$img_info = array(
			'url'    => $img_src[0],
			'width'  => $img_meta['width'],
			'height' => $img_meta['height'],
			'alt'    => get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ),
			'srcset' => wp_get_attachment_image_srcset( $thumb_id, 'full' ),
		);
		return $img_info;
	}

	/**
	 * Returns cropped image sizes.
	 *
	 * @param string $post_id Post ID.
	 * @return array Array of the width and height of the resized image for each shape.
	 */
	public static function get_cropped_size( $post_id ) {

		// Gets the image info.
		$img_info = self::get_thumbnail_info( $post_id );

		$original_orientation = 'landscape';
		if ( $img_info['height'] === $img_info['width'] ) {
			$original_orientation = 'square';
		} elseif ( $img_info['height'] > $img_info['width'] ) {
			$original_orientation = 'portrait';
		}

		$img_shapes = array();

		// Set image sizes based on original orientation and new shape.
		if ( 'landscape' === $original_orientation ) {
			$img_shapes['landscape'] = array(
				'width'  => ( 4 / 3 ) * $img_info['height'],
				'height' => ( ( 4 / 3 ) * $img_info['height'] ) * 0.75,
			);
			$img_shapes['portrait']  = array(
				'width'  => ( 3 / 4 ) * $img_info['height'],
				'height' => ( 4 / 3 ) * ( ( 3 / 4 ) * $img_info['height'] ),
			);
			$img_shapes['square']    = array(
				'width'  => $img_info['height'],
				'height' => $img_info['height'],
			);
		} elseif ( 'portrait' === $original_orientation ) {
			$img_shapes['landscape'] = array(
				'width'  => ( 4 / 3 ) * ( ( 3 / 4 ) * $img_info['width'] ),
				'height' => ( 3 / 4 ) * $img_info['width'],
			);
			$img_shapes['portrait']  = array(
				'width'  => ( 3 / 4 ) * ( ( 4 / 3 ) * $img_info['width'] ),
				'height' => ( 4 / 3 ) * $img_info['width'],
			);
			$img_shapes['square']    = array(
				'width'  => $img_info['width'],
				'height' => $img_info['width'],
			);
		} else {
			$img_shapes['landscape'] = array(
				'width'  => $img_info['width'],
				'height' => ( 3 / 4 ) * $img_info['width'],
			);
			$img_shapes['portrait']  = array(
				'width'  => ( 4 / 3 ) * $img_info['height'],
				'height' => $img_info['height'],
			);
			$img_shapes['square']    = array(
				'width'  => $img_info['width'],
				'height' => $img_info['height'],
			);
		}

		return $img_shapes;
	}

	/**
	 * Checks for Photon, and returns Photon-sized image if available; otherwise returns large-size image.
	 *
	 * @param string $post_id Post ID.
	 * @param string $shape Image shape.
	 * @param string $alignment Image alignment.
	 * @return string
	 */
	public static function get_image_markup( $post_id, $shape, $alignment ) {
		// Get large version of the featured image as a fallback.
		$sized_image = get_the_post_thumbnail( $post_id, 'large', array( 'object-fit' => 'cover' ) );

		// Check if Photon exists; if yes, get a cropped version of the image using Photon.
		if ( class_exists( 'Jetpack_PostImages' ) ) {

			// Get the size to use for the Photon image.
			$cropped = self::get_cropped_size( $post_id );

			$photon['width']  = $cropped[ $shape ]['width'];
			$photon['height'] = $cropped[ $shape ]['height'];

			// Get the image url.
			$img_info = self::get_thumbnail_info( $post_id );

			// If the image position is behind, we don't need to crop the shape (though we don't want to load anything too large).
			if ( 'behind' === $alignment ) {
				$photon['width']  = 1200;
				$photon['height'] = 9999;
			}

			// Make sure we have an image URL.
			if ( ! empty( $img_info['url'] ) ) {

				// Use the URL to get the Photon-sized version of the image.
				$img_resize = Jetpack_PostImages::fit_image_url( $img_info['url'], $photon['width'], $photon['height'] );

				$sized_image = '<img object-fit="cover" src="' . esc_url( $img_resize ) . '" alt="' . $img_info['alt'] . '">';
			}
		}

		return $sized_image;
	}

	/**
	 * Returns max-width of featured image based on original size and selected shape.
	 *
	 * @param string $post_id Post ID.
	 * @param string $display_shape Shape of image.
	 * @return array
	 */
	public static function get_maxwidth( $post_id, $shape ) {
		$image   = wp_get_attachment_metadata( get_post_thumbnail_id( $post_id ) );
		$cropped = self::get_cropped_size( $post_id );

		return $cropped[ $shape ]['width'];
	}

	/**
	 * Builds and returns query args based on block attributes.
	 *
	 * @param array $attributes An array of block attributes.
	 *
	 * @return array
	 */
	public static function build_articles_query( $attributes ) {
		global $newspack_blocks_post_id;
		if ( ! $newspack_blocks_post_id ) {
			$newspack_blocks_post_id = array();
		}

		// Get all blocks and gather specificPosts ids of all Homepage Articles blocks.
		global $newspack_blocks_all_specific_posts_ids;
		if ( ! is_array( $newspack_blocks_all_specific_posts_ids ) ) {
			$blocks                                 = parse_blocks( get_the_content() );
			$block_name                             = apply_filters( 'newspack_blocks_block_name', 'newspack-blocks/homepage-articles' );
			$newspack_blocks_all_specific_posts_ids = array_reduce(
				$blocks,
				function ( $acc, $block ) use ( $block_name ) {
					if (
						$block_name === $block['blockName'] &&
						isset( $block['attrs']['specificMode'], $block['attrs']['specificPosts'] ) &&
						count( $block['attrs']['specificPosts'] )
					) {
						return array_merge(
							$block['attrs']['specificPosts'],
							$acc
						);
					}
					return $acc;
				},
				[]
			);
		}

		$authors        = isset( $attributes['authors'] ) ? $attributes['authors'] : array();
		$categories     = isset( $attributes['categories'] ) ? $attributes['categories'] : array();
		$tags           = isset( $attributes['tags'] ) ? $attributes['tags'] : array();
		$tag_exclusions = isset( $attributes['tagExclusions'] ) ? $attributes['tagExclusions'] : array();
		$specific_posts = isset( $attributes['specificPosts'] ) ? $attributes['specificPosts'] : array();
		$posts_to_show  = intval( $attributes['postsToShow'] );
		$specific_mode  = intval( $attributes['specificMode'] );
		$args           = array(
			'post_status'         => 'publish',
			'suppress_filters'    => false,
			'ignore_sticky_posts' => true,
		);
		if ( $specific_mode && $specific_posts ) {
			$args['post__in'] = $specific_posts;
			$args['orderby']  = 'post__in';
		} else {
			$args['posts_per_page'] = $posts_to_show + count( $newspack_blocks_post_id );
			if ( count( $newspack_blocks_all_specific_posts_ids ) ) {
				$args['post__not_in'] = $newspack_blocks_all_specific_posts_ids;
			}
			if ( $authors && count( $authors ) ) {
				$args['author__in'] = $authors;
			}
			if ( $categories && count( $categories ) ) {
				$args['category__in'] = $categories;
			}
			if ( $tags && count( $tags ) ) {
				$args['tag__in'] = $tags;
			}
			if ( $tag_exclusions && count( $tag_exclusions ) ) {
				$args['tag__not_in'] = $tag_exclusions;
			}
		}
		return $args;
	}

	/**
	 * Loads a template with given data in scope.
	 *
	 * @param string $template full Path to the template to be included.
	 * @param array  $data          Data to be passed into the template to be included.
	 * @return string
	 */
	public static function template_inc( $template, $data = array() ) {
		if ( ! strpos( $template, '.php' ) ) {
			$template = $template . '.php';
		}
		if ( ! is_file( $template ) ) {
			return '';
		}
		ob_start();
		include $template;
		$contents = ob_get_contents();
		ob_end_clean();
		return $contents;
	}

	/**
	 * Prepare an array of authors, taking presence of CoAuthors Plus into account.
	 *
	 * @return array Array of WP_User objects.
	 */
	public static function prepare_authors() {
		if ( function_exists( 'coauthors_posts_links' ) ) {
			$authors = get_coauthors();
			foreach ( $authors as $author ) {
				// Check if this is a guest author post type.
				if ( 'guest-author' === get_post_type( $author->ID ) ) {
					// If yes, make sure the author actually has an avatar set; otherwise, coauthors_get_avatar returns a featured image.
					if ( get_post_thumbnail_id( $author->ID ) ) {
						$author->avatar = coauthors_get_avatar( $author, 48 );
					} else {
						// If there is no avatar, force it to return the current fallback image.
						$author->avatar = get_avatar( ' ' );
					}
				} else {
					$author->avatar = coauthors_get_avatar( $author, 48 );
				}
				$author->url = get_author_posts_url( $author->ID, $author->user_nicename );
			}
			return $authors;
		}
		$id = get_the_author_meta( 'ID' );
		return array(
			(object) array(
				'ID'            => $id,
				'avatar'        => get_avatar( $id, 48 ),
				'url'           => get_author_posts_url( $id ),
				'user_nicename' => get_the_author(),
				'display_name'  => get_the_author_meta( 'display_name' ),
			),
		);
	}

	/**
	 * Prepare a list of classes based on assigned tags and categories.
	 *
	 * @param string $post_id Post ID.
	 * @return string CSS classes.
	 */
	public static function get_term_classes( $post_id ) {
		$classes = [];

		$tags = get_the_terms( $post_id, 'post_tag' );
		if ( ! empty( $tags ) ) {
			foreach ( $tags as $tag ) {
				$classes[] = 'tag-' . $tag->slug;
			}
		}

		$categories = get_the_terms( $post_id, 'category' );
		if ( ! empty( $categories ) ) {
			foreach ( $categories as $cat ) {
				$classes[] = 'category-' . $cat->slug;
			}
		}

		return implode( ' ', $classes );
	}

	/**
	 * Get patterns for post type.
	 *
	 * @param string $post_type Post type.
	 * @return array Array of patterns.
	 */
	public static function get_patterns_for_post_type( $post_type = null ) {
		$patterns    = apply_filters( 'newspack_blocks_patterns', [], $post_type );
		$categorized = [];
		$clean       = [];
		foreach ( $patterns as $pattern ) {
			if ( ! isset( $pattern['image'] ) || ! $pattern['image'] ) {
				continue;
			}
			$category = isset( $pattern['category'] ) ? $pattern['category'] : __( 'Common', 'newspack-blocks' );
			if ( ! isset( $categorized[ $category ] ) ) {
				$categorized[ $category ] = [];
			}
			$categorized[ $category ][] = $pattern;
		}
		$categories = array_keys( $categorized );
		sort( $categories );
		foreach ( $categories as $category ) {
			$clean[] = [
				'title' => $category,
				'items' => $categorized[ $category ],
			];
		}
		return $clean;
	}
}
Newspack_Blocks::init();
