<?php
/**
 * Articles loop template.
 *
 * @package WordPress
 * @global \WP_Query $article_query Article query.
 * @global array     $attributes
 * @global array     $newspack_blocks_post_id
 */

call_user_func(
	function( $data ) {
		$attributes    = $data['attributes'];
		$article_query = $data['article_query'];

		global $newspack_blocks_post_id;
		do_action( 'newspack_blocks_homepage_posts_before_render' );

		Newspack_Blocks::filter_excerpt( $attributes );

		$jetpack_share_buttons_disabled = false;
		if ( function_exists( 'sharing_maybe_enqueue_scripts' )
			&& ! sharing_maybe_enqueue_scripts() ) {
			$jetpack_share_buttons_disabled = true;
		}

		$enable_post_duplication = apply_filters( 'newspack_blocks_homepage_enable_duplication', false );
		while ( $article_query->have_posts() ) {
			$article_query->the_post();
			if ( ! $enable_post_duplication ) {
				$newspack_blocks_post_id[ get_the_ID() ] = true;
			}
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo Newspack_Blocks::template_inc(
				__DIR__ . '/article.php',
				array(
					'attributes'                     => $attributes,
					'jetpack_share_buttons_disabled' => $jetpack_share_buttons_disabled,
				)
			);
		}

		Newspack_Blocks::remove_excerpt_filter();

		do_action( 'newspack_blocks_homepage_posts_after_render' );
		wp_reset_postdata();
	},
	$data // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UndefinedVariable
);
