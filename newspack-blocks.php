<?php
/**
 * Plugin Name:     Newspack Blocks
 * Plugin URI:      PLUGIN SITE HERE
 * Description:     PLUGIN DESCRIPTION HERE
 * Author:          YOUR NAME HERE
 * Author URI:      YOUR SITE HERE
 * Text Domain:     newspack-blocks
 * Domain Path:     /languages
 * Version:         0.1.0
 *
 * @package         Newspack_Blocks
 */

define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '0.1.0' );
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
	}

	/**
	 * Include index.php file if exists.
	 */
	public static function include_index_php() {
		if ( is_admin() ) {
			// In editor environment, do nothing.
			return;
		}
		$src_directory = NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/';
		$iterator      = new DirectoryIterator( $src_directory );
		foreach ( $iterator as $block_directory ) {
			if ( ! $block_directory->isDir() || $block_directory->isDot() ) {
				continue;
			}
			$type = $block_directory->getFilename();

			/* If index.php is found, include it and use generic functions. */
			$index_php_path = $src_directory . $type . '/index.php';
			if ( file_exists( $index_php_path ) ) {
				include_once $index_php_path;
			}
		}
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
	public static function block_classes( $type, $attributes = array() ) {
		$align   = isset( $attributes['align'] ) ? $attributes['align'] : 'center';
		$classes = array(
			"wp-block-newspack-blocks-{$type}",
			"align{$align}",
		);
		if ( isset( $attributes['className'] ) ) {
			array_push( $classes, $attributes['className'] );
		}
		return implode( $classes, ' ' );
	}
}
Newspack_Blocks::include_index_php();
Newspack_Blocks::manage_view_scripts();
add_action( 'enqueue_block_editor_assets', array( 'Newspack_Blocks', 'enqueue_block_editor_assets' ) );
