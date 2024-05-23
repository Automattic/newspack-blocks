<?php
/**
 * Subscribe Pattern 7.
 *
 * @package Newspack_Blocks
 */

return array(
	'title'         => esc_html__( 'Subscribe Pattern 7', 'newspack-blocks' ),
	'content'       => "<!-- wp:media-text {\"align\":\"full\",\"mediaPosition\":\"right\",\"mediaType\":\"image\",\"verticalAlignment\":\"top\",\"imageFill\":true,\"className\":\"newspack-pattern subscribe__style-squeeze\"} -->\n<div class=\"wp-block-media-text alignfull has-media-on-the-right is-stacked-on-mobile is-vertically-aligned-top is-image-fill newspack-pattern subscribe__style-squeeze\"><div class=\"wp-block-media-text__content\"><!-- wp:group {\"metadata\":{\"name\":\"Text\"},\"style\":{\"dimensions\":{\"minHeight\":\"100vh\"}},\"layout\":{\"type\":\"flex\",\"orientation\":\"vertical\",\"verticalAlignment\":\"center\",\"justifyContent\":\"stretch\"}} -->\n<div class=\"wp-block-group\" style=\"min-height:100vh\"><!-- wp:group {\"metadata\":{\"name\":\"Subscribe\"},\"align\":\"full\",\"style\":{\"spacing\":{\"padding\":{\"top\":\"var:preset|spacing|80\",\"bottom\":\"var:preset|spacing|80\",\"left\":\"var:preset|spacing|80\",\"right\":\"var:preset|spacing|80\"}}},\"layout\":{\"type\":\"constrained\"}} -->\n<div class=\"wp-block-group alignfull\" style=\"padding-top:var(--wp--preset--spacing--80);padding-right:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80);padding-left:var(--wp--preset--spacing--80)\"><!-- wp:group {\"metadata\":{\"name\":\"Intro\"},\"style\":{\"spacing\":{\"blockGap\":\"var:preset|spacing|40\"}},\"layout\":{\"type\":\"flex\",\"orientation\":\"vertical\",\"justifyContent\":\"left\"}} -->\n<div class=\"wp-block-group\"><!-- wp:image {\"width\":\"72px\",\"height\":\"72px\",\"scale\":\"cover\",\"sizeSlug\":\"large\",\"linkDestination\":\"none\",\"align\":\"center\",\"className\":\"is-style-rounded\"} -->\n<figure class=\"wp-block-image aligncenter size-large is-resized is-style-rounded\"><img src=\"" . $subscribe_image . "\" alt=\"\" style=\"object-fit:cover;width:72px;height:72px\"/></figure>\n<!-- /wp:image -->\n\n<!-- wp:group {\"metadata\":{\"name\":\"Title + Description\"},\"style\":{\"spacing\":{\"blockGap\":\"var:preset|spacing|20\"}},\"layout\":{\"type\":\"flex\",\"orientation\":\"vertical\",\"justifyContent\":\"stretch\"}} -->\n<div class=\"wp-block-group\"><!-- wp:heading {\"metadata\":{\"name\":\"Title\"}} -->\n<h2 class=\"wp-block-heading\">" . $subscribe_title . "</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph {\"metadata\":{\"name\":\"Description\"}} -->\n<p>" . $subscribe_desc . "</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:group --></div>\n<!-- /wp:group -->\n\n<!-- wp:newspack-newsletters/subscribe {\"lists\":[],\"className\":\"is-style-modern\",\"backgroundColor\":\"#1e1e1e\"} /--></div>\n<!-- /wp:group --></div>\n<!-- /wp:group --></div><figure class=\"wp-block-media-text__media\" style=\"background-image:url(" . $subscribe_cover . ");background-position:50% 50%\"><img src=\"" . $subscribe_cover . "\" alt=\"\"/></figure></div>\n<!-- /wp:media-text -->",
	'viewportWidth' => 910,
	'categories'    => array( 'newspack-subscribe' ),
);
