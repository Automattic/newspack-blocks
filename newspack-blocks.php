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
}
add_action( 'enqueue_block_editor_assets', array( 'Newspack_Blocks', 'enqueue_block_editor_assets' ) );
