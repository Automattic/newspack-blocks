<?php
/**
 * Register Newspack block patterns.
 *
 * @package Newspack_Blocks
 */

add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$patterns[] = [
				'category' => __( 'Homepage Articles', 'newspack-blocks' ),
				'content'  => '
					<!-- wp:newspack-blocks/homepage-articles {"showExcerpt":false,"postLayout":"grid","mediaPosition":"left"} /-->
				',
				'icon'     => plugins_url( 'pattern_icons/pattern-1.png', __FILE__ ),
				'title'    => __( 'Homepage Layout 1', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$patterns[] = [
				'category' => __( 'Homepage Articles', 'newspack-blocks' ),
				'content'  => '
					<!-- wp:columns {"className":"is-style-borders"} -->
					<div class="wp-block-columns is-style-borders"><!-- wp:column {"width":66.66} -->
					<div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:newspack-blocks/homepage-articles {"postsToShow":1,"categories":[845],"sectionHeader":"Entertainment"} /--></div>
					<!-- /wp:column -->

					<!-- wp:column {"width":33.33} -->
					<div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:newspack-blocks/homepage-articles {"showExcerpt":false,"imageShape":"square","showAvatar":false,"mediaPosition":"left","categories":[848],"typeScale":2,"imageScale":1,"sectionHeader":"Events"} /-->

					<!-- wp:separator {"className":"is-style-wide"} -->
					<hr class="wp-block-separator is-style-wide"/>
					<!-- /wp:separator -->

					<!-- wp:newspack-blocks/homepage-articles {"showExcerpt":false,"imageShape":"square","mediaPosition":"left","categories":[843],"typeScale":2,"imageScale":1,"sectionHeader":"Featured"} /--></div>
					<!-- /wp:column --></div>
					<!-- /wp:columns -->

					<!-- wp:separator {"className":"is-style-wide"} -->
					<hr class="wp-block-separator is-style-wide"/>
					<!-- /wp:separator -->

					<!-- wp:columns {"className":"is-style-borders"} -->
					<div class="wp-block-columns is-style-borders"><!-- wp:column -->
					<div class="wp-block-column"><!-- wp:newspack-blocks/homepage-articles {"className":"is-style-borders","showExcerpt":false,"showAuthor":false,"postsToShow":1,"categories":[854],"typeScale":3,"imageScale":1,"sectionHeader":"Health"} /-->

					<!-- wp:newspack-blocks/homepage-articles {"className":"is-style-borders","showExcerpt":false,"showAuthor":false,"showAvatar":false,"postsToShow":2,"mediaPosition":"left","categories":[849],"typeScale":2,"imageScale":1} /--></div>
					<!-- /wp:column -->

					<!-- wp:column -->
					<div class="wp-block-column"><!-- wp:newspack-blocks/homepage-articles {"className":"is-style-borders","showExcerpt":false,"showAuthor":false,"postsToShow":1,"categories":[847],"typeScale":3,"imageScale":1,"sectionHeader":"News"} /-->

					<!-- wp:newspack-blocks/homepage-articles {"className":"is-style-borders","showExcerpt":false,"showAuthor":false,"showAvatar":false,"postsToShow":2,"mediaPosition":"left","categories":[846],"typeScale":2,"imageScale":1} /--></div>
					<!-- /wp:column -->

					<!-- wp:column -->
					<div class="wp-block-column"><!-- wp:newspack-blocks/homepage-articles {"className":"is-style-borders","showExcerpt":false,"showImage":false,"showAuthor":false,"showAvatar":false,"postsToShow":1,"mediaPosition":"left","categories":[851],"imageScale":1,"sectionHeader":"Politics"} /-->

					<!-- wp:newspack-blocks/homepage-articles {"className":"is-style-borders","showExcerpt":false,"showImage":false,"showAuthor":false,"showAvatar":false,"postsToShow":4,"mediaPosition":"left","categories":[852],"typeScale":3,"imageScale":1} /--></div>
					<!-- /wp:column --></div>
					<!-- /wp:columns -->
				',
				'icon'     => plugins_url( 'pattern_icons/pattern-1.png', __FILE__ ),
				'title'    => __( 'Homepage Layout 2', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
add_filter(
	'newspack_blocks_patterns',
	function( $patterns, $post_type ) {
		if ( in_array( $post_type, [ 'post', 'page' ], true ) ) {
			$patterns[] = [
				'category' => __( 'Donations', 'newspack-blocks' ),
				'content'  => '
					<!-- wp:paragraph -->
					<p>With the support of readers like you, we provide thoughtfully researched articles for a more informed and connected community. This is your chance to support credible, community-based, public-service journalism. Please join us!</p>
					<!-- /wp:paragraph -->

					<!-- wp:newspack-blocks/donate {"manual":false,"suggestedAmounts":[7.5,15,30],"suggestedAmountUntiered":25} /-->

					<!-- wp:heading -->
					<h2>Donation</h2>
					<!-- /wp:heading -->

					<!-- wp:paragraph -->
					<p>Edit and add to this content to tell your publication\'s story and explain the benefits of becoming a member. This is a good place to mention any special member privileges, let people know that donations are tax-deductible, or provide any legal information.</p>
					<!-- /wp:paragraph -->
				',
				'icon'     => plugins_url( 'pattern_icons/pattern-1.png', __FILE__ ),
				'title'    => __( 'Donate Layout 1', 'newspack-blocks' ),
			];
		}
		return $patterns;
	},
	10,
	2
);
