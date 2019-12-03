<?php
/**
 * @global WP_Query $article_query Article query.
 * @global array    $attributes
 */

echo Newspack_Blocks::template_inc( __DIR__ . '/articles-loop.php', [
	'attributes'    => $attributes,
	'article_query' => $article_query,
] );
