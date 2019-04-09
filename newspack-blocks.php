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
		$dependencies  = array(
			'lodash',
			'wp-api-fetch',
			'wp-blob',
			'wp-blocks',
			'wp-components',
			'wp-compose',
			'wp-data',
			'wp-date',
			'wp-edit-post',
			'wp-editor',
			'wp-element',
			'wp-escape-html',
			'wp-hooks',
			'wp-i18n',
			'wp-keycodes',
			'wp-plugins',
			'wp-polyfill',
			'wp-rich-text',
			'wp-token-list',
			'wp-url',
		);
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
}
add_action( 'enqueue_block_editor_assets', array( 'Newspack_Blocks', 'enqueue_block_editor_assets' ) );
