<?php
/**
 * Newspack list homepage block
 *
 * @package Newspack_Blocks
 */

/**
 * Require the base class
 */

require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/shared/homepage-articles/class-newspack-blocks-homepage-articles.php';

/**
 * Server-side rendering for Homepage Articles Hero
 *
 * @package WordPress
 */
class Newspack_Blocks_Homepage_Articles_List extends Newspack_Blocks_Homepage_Articles {
	/**
	 * The block's name (slug)
	 *
	 * @var name
	 **/
	public $name = 'homepage-articles-list';

	/**
	 * Conditionally show the post author
	 *
	 * @var Show author
	 **/
	public $show_author = true;

	/**
	 * Conditionally show the post author's avatar
	 *
	 * @var Show avatar
	 **/
	public $show_avatar = true;
}

$newspack_blocks_homepage_articles_list = new Newspack_Blocks_Homepage_Articles_List();
add_action( 'init', array( $newspack_blocks_homepage_articles_list, 'register' ) );
