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
	 * An array of slugs for the blocks that require server-side handling (rendering, or asset loading)
	 *
	 * @var array $newspack_blocks_blocks Arry of block slugs that require server-side handling (rendering or asset loading)
	 */
	public static $newspack_blocks_blocks = array( 'homepage-articles' );

	/**
	 * Enqueue block scripts and styles for editor.
	 */
	public static function newspack_blocks_enqueue_block_editor_assets() {
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

	/**
	 * Enqueue block scripts and styles for view.
	 */
	public static function newspack_blocks_enqueue_block_view_assets() {
		if ( is_admin() ) {
			// A block's view assets will not be required in wp-admin.
			return;
		}
		foreach ( self::$newspack_blocks_blocks as $newspack_blocks_block ) {
			$newspack_blocks_view_path = NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/' . $newspack_blocks_block . '/index.php';
			if ( file_exists( $newspack_blocks_view_path ) ) {
				include_once $newspack_blocks_view_path;
			}
		}
	}

	/**
	 * Enqueue view scripts and styles for a single block.
	 *
	 * @param string $type The block's slug.
	 * @param array  $dependencies An array of script dependencies.
	 */
	public static function newspack_blocks_enqueue_view_assets( $type, $dependencies = array() ) {
		$style_path  = BLOCKS_DIRECTORY . $type . '/view' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		$script_path = BLOCKS_DIRECTORY . $type . '/view.js';

		if ( file_exists( NEWSPACK__PLUGIN_DIR . $style_path ) ) {
			wp_enqueue_style(
				"newspack-block-{$type}",
				plugins_url( $style_path, __FILE__ ),
				array(),
				NEWSPACK_BLOCKS__VERSION
			);
		}

		if ( file_exists( NEWSPACK__PLUGIN_DIR . $script_path ) ) {
			wp_enqueue_script(
				"newspack-block-{$type}",
				plugins_url( $script_path, __FILE__ ),
				$dependencies,
				array(),
				NEWSPACK_BLOCKS__VERSION
			);
		}
	}

	/**
	 * An array of post IDs that have been show by a block on the current page
	 *
	 * @var array $newspack_blocks_already_shown Arry of block slugs that require server-side handling (rendering or asset loading)
	 */
	private static $newspack_blocks_already_shown = array();

	/**
	 * Get the number of posts that have been shown on the curren page.
	 *
	 * @return number The number of posts that have been shown on the current page.
	 */
	private static function newspack_blocks_already_shown_count() {
		return count( self::$newspack_blocks_already_shown );
	}

	/**
	 * Determine if a post has been shown on the current page already. If it has not, add it to the array for future checks.
	 *
	 * @param number $post_id The ID of the post to check.
	 *
	 * @return boolean
	 */
	private static function newspack_blocks_should_show_post( $post_id ) {
		if ( ! in_array( $post_id, self::$newspack_blocks_already_shown, true ) ) {
			self::$newspack_blocks_already_shown[] = $post_id;
			return true;
		}
		return false;
	}

	/**
	 * Get an array of posts based on query parameters and limit.
	 *
	 * @param object $args Query parameters (should NOT include posts_per_page).
	 *
	 * @param number $limit Desired number of posts.
	 *
	 * @return array An array of posts.
	 */
	public static function newspack_blocks_posts_with_args_and_limit( $args = array(), $limit = 0 ) {
		$args['posts_per_page'] = $limit + self::newspack_blocks_already_shown_count();
		$all_posts              = get_posts( $args );
		$counter                = 0;
		$posts                  = array();
		foreach ( $all_posts as $post ) {
			if ( $counter > $limit ) {
				break;
			}
			if ( self::newspack_blocks_should_show_post( $post->ID ) ) {
				$posts[] = $post;
				$counter++;
			}
		}
		return $posts;
	}
}

Newspack_Blocks::newspack_blocks_enqueue_block_view_assets();
add_action( 'enqueue_block_editor_assets', array( 'Newspack_Blocks', 'newspack_blocks_enqueue_block_editor_assets' ) );
