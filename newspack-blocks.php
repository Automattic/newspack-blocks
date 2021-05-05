<?php
/**
 * Plugin Name:     Newspack Blocks
 * Plugin URI:      https://newspack.blog/
 * Description:     A collection of blocks for news publishers.
 * Author:          Automattic
 * Author URI:      https://newspack.blog/
 * Text Domain:     newspack-blocks
 * Domain Path:     /languages
 * Version:         1.25.1
 *
 * @package         Newspack_Blocks
 */

define( 'NEWSPACK_BLOCKS__PLUGIN_FILE', __FILE__ );
define( 'NEWSPACK_BLOCKS__BLOCKS_DIRECTORY', 'dist/' );
define( 'NEWSPACK_BLOCKS__PLUGIN_DIR', plugin_dir_path( NEWSPACK_BLOCKS__PLUGIN_FILE ) );
define( 'NEWSPACK_BLOCKS__VERSION', '1.25.1' );

require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'includes/class-newspack-blocks.php';
require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'includes/class-newspack-blocks-api.php';
require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'includes/class-newspack-blocks-patterns.php';

// REST Controller for Articles Block.
require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/homepage-articles/class-wp-rest-newspack-articles-controller.php';

/**
 * Registers Articles block routes.
 */
function newspack_articles_block_register_rest_routes() { // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedFunctionFound
	$articles_controller = new WP_REST_Newspack_Articles_Controller();
	$articles_controller->register_routes();
}
add_action( 'rest_api_init', 'newspack_articles_block_register_rest_routes' );

Newspack_Blocks::manage_view_scripts();
add_action( 'enqueue_block_editor_assets', array( 'Newspack_Blocks', 'enqueue_block_editor_assets' ) );
add_action( 'wp_enqueue_scripts', array( 'Newspack_Blocks', 'enqueue_block_styles_assets' ) );

/**
 * Load language files
 *
 * @action plugins_loaded
 */
function newspack_blocks_plugin_textdomain() {
	load_plugin_textdomain( 'newspack-blocks', false, dirname( plugin_basename( NEWSPACK_BLOCKS__PLUGIN_FILE ) ) . '/languages' );
}
add_action( 'plugins_loaded', 'newspack_blocks_plugin_textdomain' );
