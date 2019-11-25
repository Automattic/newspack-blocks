<?php
/**
 * Plugin Name:     Newspack Blocks
 * Plugin URI:      PLUGIN SITE HERE
 * Description:     PLUGIN DESCRIPTION HERE
 * Author:          YOUR NAME HERE
 * Author URI:      YOUR SITE HERE
 * Text Domain:     newspack-blocks
 * Domain Path:     /languages
 * Version:         1.0.0-alpha.17
 *
 * @package         Newspack_Blocks
 */

define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.0.0-alpha.17' );

require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'class-newspack-blocks.php';
require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'class-newspack-blocks-api.php';

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

	add_image_size( 'newspack-article-block-uncropped', 1200, 9999, false );
}
add_action( 'after_setup_theme', 'newspack_blocks_image_sizes' );

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
