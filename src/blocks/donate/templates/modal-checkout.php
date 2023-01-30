<?php
/**
 * Template Name: Donate Modal Checkout
 *
 * @package Newspack_Blocks
 */

wp_head();
while ( have_posts() ) {
	the_post();
	echo '<div id="newspack_modal_checkout">';
		the_content();
	echo '</div>';
}
wp_footer();
