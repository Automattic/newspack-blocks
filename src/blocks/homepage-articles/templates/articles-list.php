<?php
/**
 * Article list template.
 *
 * @global WP_Query $article_query Article query.
 * @global array    $attributes
 * @package WordPress
 */

call_user_func(
	function( $data ) {
		echo wp_kses_post(
			Newspack_Blocks::template_inc(
				__DIR__ . '/articles-loop.php',
				array(
					'attributes'    => $data['attributes'],
					'article_query' => $data['article_query'],
				)
			)
		);
	},
	$data
);
