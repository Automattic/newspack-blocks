<?php
/**
 * Newspack hero homepage block
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
class Newspack_Blocks_Homepage_Articles_Hero extends Newspack_Blocks_Homepage_Articles {
	/**
	 * The block's name (slug)
	 *
	 * @var name
	 **/
	public $name = 'homepage-articles-hero';

	/**
	 * Conditionally show the post image
	 *
	 * @var Show Image
	 **/
	public $show_image = true;

	/**
	 * Conditionally show the post excerpt
	 *
	 * @var Show Excerpt
	 **/
	public $show_excerpt = true;

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

$newspack_blocks_homepage_articles_hero = new Newspack_Blocks_Homepage_Articles_Hero();
add_action( 'init', array( $newspack_blocks_homepage_articles_hero, 'register' ) );
