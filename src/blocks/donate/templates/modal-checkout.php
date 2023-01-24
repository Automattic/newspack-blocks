<?php
/**
 * Template Name: Donate Modal Checkout
 *
 * @package Newspack_Blocks
 */

wp_head();
while ( have_posts() ) {
	the_post();
	the_content();
}
wp_footer();
