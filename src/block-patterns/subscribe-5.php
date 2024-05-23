<?php
/**
 * Subscribe Pattern 5.
 *
 * @package Newspack_Blocks
 */

return array(
	'title'         => __( 'Subscribe Pattern 5', 'newspack-blocks' ),
	'content'       => "<!-- wp:cover {\"url\":\"" . $subscribe_cover . "\",\"dimRatio\":20,\"overlayColor\":\"black\",\"isUserOverlayColor\":true,\"minHeight\":85,\"minHeightUnit\":\"vh\",\"metadata\":{\"name\":\"Subscribe\"},\"align\":\"full\",\"style\":{\"spacing\":{\"padding\":{\"top\":\"var:preset|spacing|80\",\"bottom\":\"var:preset|spacing|80\"}}},\"layout\":{\"type\":\"constrained\"}} -->\n<div class=\"wp-block-cover alignfull\" style=\"padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80);min-height:85vh\"><span aria-hidden=\"true\" class=\"wp-block-cover__background has-black-background-color has-background-dim-20 has-background-dim\"></span><img class=\"wp-block-cover__image-background\" alt=\"\" src=\"" . $subscribe_cover . "\" data-object-fit=\"cover\"/><div class=\"wp-block-cover__inner-container\"><!-- wp:group {\"metadata\":{\"name\":\"Intro\"},\"style\":{\"spacing\":{\"blockGap\":\"var:preset|spacing|40\"}},\"layout\":{\"type\":\"flex\",\"orientation\":\"vertical\",\"justifyContent\":\"center\"}} -->\n<div class=\"wp-block-group\"><!-- wp:image {\"width\":\"72px\",\"height\":\"72px\",\"scale\":\"cover\",\"sizeSlug\":\"large\",\"linkDestination\":\"none\",\"align\":\"center\",\"className\":\"is-style-rounded\"} -->\n<figure class=\"wp-block-image aligncenter size-large is-resized is-style-rounded\"><img src=\"" . $subscribe_image . "\" alt=\"\" style=\"object-fit:cover;width:72px;height:72px\"/></figure>\n<!-- /wp:image -->\n\n<!-- wp:group {\"metadata\":{\"name\":\"Title + Description\"},\"style\":{\"spacing\":{\"blockGap\":\"var:preset|spacing|20\"}},\"layout\":{\"type\":\"flex\",\"orientation\":\"vertical\",\"justifyContent\":\"stretch\"}} -->\n<div class=\"wp-block-group\"><!-- wp:heading {\"textAlign\":\"center\",\"metadata\":{\"name\":\"Title\"}} -->\n<h2 class=\"wp-block-heading has-text-align-center\">" . $subscribe_title . "</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph {\"align\":\"center\",\"metadata\":{\"name\":\"Description\"}} -->\n<p class=\"has-text-align-center\">" . $subscribe_desc . "</p>\n<!-- /wp:paragraph --></div>\n<!-- /wp:group --></div>\n<!-- /wp:group -->\n\n<!-- wp:newspack-newsletters/subscribe {\"lists\":[],\"className\":\"is-style-modern\"} /--></div></div>\n<!-- /wp:cover -->",
	'viewportWidth' => 910,
	'categories'    => array( 'newspack-subscribe' ),
);
