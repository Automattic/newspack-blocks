<?php
/**
 * Homepage Posts Pattern 26.
 *
 * @package Newspack_Blocks
 */

return array(
	'title'         => __( 'Homepage Posts Pattern 26', 'newspack-blocks' ),
	'content'       => "<!-- wp:group {\"className\":\"newspack-pattern homepage-posts__style-26\"} -->\n<div class=\"wp-block-group newspack-pattern homepage-posts__style-26\"><div class=\"wp-block-group__inner-container\"><!-- wp:columns {\"className\":\"is-style-first-col-to-second\"} -->\n<div class=\"wp-block-columns is-style-first-col-to-second\"><!-- wp:column {\"width\":50} -->\n<div class=\"wp-block-column\" style=\"flex-basis:50%\"><!-- wp:newspack-blocks/homepage-articles {\"showAuthor\":false,\"postsToShow\":1,\"typeScale\":6} /-->\n\n<!-- wp:newspack-blocks/homepage-articles {\"excerptLength\":25,\"showAuthor\":false,\"mediaPosition\":\"left\",\"typeScale\":2,\"imageScale\":2} /--></div>\n<!-- /wp:column -->\n\n<!-- wp:column {\"width\":25} -->\n<div class=\"wp-block-column\" style=\"flex-basis:25%\"><!-- wp:newspack-blocks/homepage-articles {\"className\":\"is-style-default\",\"showExcerpt\":false,\"showAuthor\":false,\"showAvatar\":false,\"postsToShow\":4,\"typeScale\":3,\"imageScale\":1} /--></div>\n<!-- /wp:column -->\n\n<!-- wp:column {\"width\":25} -->\n<div class=\"wp-block-column\" style=\"flex-basis:25%\"><!-- wp:newspack-blocks/homepage-articles {\"className\":\"is-style-borders\",\"excerptLength\":12,\"showImage\":false,\"showAuthor\":false,\"showAvatar\":false,\"postsToShow\":7,\"mediaPosition\":\"left\",\"typeScale\":2,\"imageScale\":1} /--></div>\n<!-- /wp:column --></div>\n<!-- /wp:columns --></div></div>\n<!-- /wp:group -->",
	'viewportWidth' => 1000,
	'categories'    => array( 'newspack-homepage-posts' ),
);
