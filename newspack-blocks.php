<?php
/**
 * Plugin Name:     Newspack Blocks
 * Plugin URI:      PLUGIN SITE HERE
 * Description:     PLUGIN DESCRIPTION HERE
 * Author:          YOUR NAME HERE
 * Author URI:      YOUR SITE HERE
 * Text Domain:     newspack-blocks
 * Domain Path:     /languages
 * Version:         1.0.0-alpha.11
 *
 * @package         Newspack_Blocks
 */

define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.0.0-alpha.11' );
/**
 * Newspack blocks functionality
 */

class Newspack_Blocks {
	/**
	 * Enqueue block scripts and styles for editor.
	 */
	public static function enqueue_block_editor_assets() {
		$editor_script = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.js', __FILE__ );
		$editor_style  = plugins_url( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'editor.css', __FILE__ );
		$dependencies  = self::dependencies_from_path( NEWSPACK_BLOCKS__PLUGIN_DIR . 'dist/editor.deps.json' );
		wp_enqueue_script(
			'newspack-blocks-editor',
			$editor_script,
			$dependencies,
			NEWSPACK_BLOCKS__VERSION,
			true
		);

		wp_enqueue_style(
			'newspack-blocks-editor',
			$editor_style,
			array(),
			NEWSPACK_BLOCKS__VERSION
		);

		wp_set_script_translations(
			'newspack-blocks-editor',
			'newspack-blocks',
			plugin_dir_path( __FILE__ ) . 'languages'
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
		$style_path  = NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . $type . '/view' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		$script_path = NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . $type . '/view.js';
		if ( file_exists( NEWSPACK_BLOCKS__PLUGIN_DIR . $style_path ) ) {
			wp_enqueue_style(
				"newspack-blocks-{$type}",
				plugins_url( $style_path, __FILE__ ),
				array(),
				NEWSPACK_BLOCKS__VERSION
			);
		}
		if ( self::is_amp() ) {
			return;
		}
		if ( file_exists( NEWSPACK_BLOCKS__PLUGIN_DIR . $script_path ) ) {
			$dependencies = self::dependencies_from_path( NEWSPACK_BLOCKS__PLUGIN_DIR . "dist/{$type}/view.deps.json" );
			wp_enqueue_script(
				"newspack-blocks-{$type}",
				plugins_url( $script_path, __FILE__ ),
				$dependencies,
				array(),
				NEWSPACK_BLOCKS__VERSION
			);
		}
	}

	/**
	 * Parse generated .deps.json file and return array of dependencies to be enqueued.
	 *
	 * @param string $path Path to the generated dependencies file.
	 *
	 * @return array Array of dependencides.
	 */
	public static function dependencies_from_path( $path ) {
		$dependencies = file_exists( $path )
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			? json_decode( file_get_contents( $path ) )
			: array();
		$dependencies[] = 'wp-polyfill';
		return $dependencies;
	}

	/**
	 * Utility to assemble the class for a server-side rendered bloc
	 *
	 * @param string $type The block type.
	 * @param array  $attributes Block attributes.
	 *
	 * @return string Class list separated by spaces.
	 */
	public static function block_classes( $type, $attributes = array(), $extra = array() ) {
		$align   = isset( $attributes['align'] ) ? $attributes['align'] : 'center';
		$classes = array(
			"wp-block-newspack-blocks-{$type}",
			"align{$align}",
		);
		if ( isset( $attributes['className'] ) ) {
			array_push( $classes, $attributes['className'] );
		}
		if ( is_array( $extra ) && ! empty( $extra ) ) {
			$classes = array_merge( $classes, $extra );
		}
		return implode( $classes, ' ' );
	}

	/**
	 * Checks whether the current view is served in AMP context.
	 *
	 * @return bool True if AMP, false otherwise.
	 */
	public static function is_amp() {
		return ! is_admin() && function_exists( 'is_amp_endpoint' ) && is_amp_endpoint();
	}
}

/**
 * Add image sizes
 */
function newspack_blocks_image_sizes() {
	add_image_size( 'newspack-article-block-landscape-large', 1200, 900, true );
	add_image_size( 'newspack-article-block-portrait-large', 900, 1200, true );
	add_image_size( 'newspack-article-block-square-large', 1200, 1200, true );

	add_image_size( 'newspack-article-block-landscape-medium', 800, 600, true );
	add_image_size( 'newspack-article-block-portrait-medium', 600, 800, true );
	add_image_size( 'newspack-article-block-square-medium', 800, 800, true );

	add_image_size( 'newspack-article-block-landscape-small', 400, 300, true );
	add_image_size( 'newspack-article-block-portrait-small', 300, 400, true );
	add_image_size( 'newspack-article-block-square-small', 400, 400, true );

	add_image_size( 'newspack-article-block-landscape-tiny', 200, 150, true );
	add_image_size( 'newspack-article-block-portrait-tiny', 150, 200, true );
	add_image_size( 'newspack-article-block-square-tiny', 200, 200, true );
}
add_action( 'after_setup_theme', 'newspack_blocks_image_sizes' );

/**
 * Return the most appropriate thumbnail size to display.
 *
 * @param string $orientation The block's orientation settings: landscape|portrait|square.
 *
 * @return string Returns the thumbnail key to use.
 */
function newspack_blocks_image_size_for_orientation( $orientation = 'landscape' ) {
	$sizes = array(
		'landscape' => array(
			'large'  => array(
				1200,
				900,
			),
			'medium' => array(
				800,
				600,
			),
			'small'  => array(
				400,
				300,
			),
			'tiny'   => array(
				200,
				150,
			),
		),
		'portrait'  => array(
			'large'  => array(
				900,
				1200,
			),
			'medium' => array(
				600,
				800,
			),
			'small'  => array(
				300,
				400,
			),
			'tiny'   => array(
				150,
				200,
			),
		),
		'square'    => array(
			'large'  => array(
				1200,
				1200,
			),
			'medium' => array(
				800,
				800,
			),
			'small'  => array(
				400,
				400,
			),
			'tiny'   => array(
				200,
				200,
			),
		),
	);

	foreach ( $sizes[ $orientation ] as $key => $dimensions ) {
		$attachment = wp_get_attachment_image_src(
			get_post_thumbnail_id( get_the_ID() ),
			'newspack-article-block-' . $orientation . '-' . $key
		);
		if ( $dimensions[0] === $attachment[1] && $dimensions[1] === $attachment[2] ) {
			return 'newspack-article-block-' . $orientation . '-' . $key;
		}
	}
}

Newspack_Blocks::manage_view_scripts();
add_action( 'enqueue_block_editor_assets', array( 'Newspack_Blocks', 'enqueue_block_editor_assets' ) );
add_action( 'wp_enqueue_scripts', array( 'Newspack_Blocks', 'enqueue_block_styles_assets' ) );

/**
 * Load language files
 *
 * @action plugins_loaded
 */
function newspack_blocks_plugin_textdomain() {
	load_plugin_textdomain( 'newspack-blocks', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'newspack_blocks_plugin_textdomain' );
