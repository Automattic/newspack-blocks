<?php
/**
 * Registers Newspack block patterns and categories.
 *
 * @package Newspack_Blocks
 */
function newspack_register_block_patterns_and_categories() {
	$should_register_patterns = get_theme_support( 'core-block-patterns' );
	$mailchimp_available = false;
	$donations_configured = false;

	if ( has_block( 'jetpack/mailchimp' ) ) {
		$mailchimp_available = true;
	}

	if ( class_exists( 'Newspack\Donations' ) ) {
		$settings = Newspack\Donations::get_donation_settings();
		if ( ! is_wp_error( $settings ) && $settings['created'] ) {
			$donations_configured = true;
		}
	}

	if ( $should_register_patterns ) {
		$newspack_block_patterns = array(
			'homepage-posts-1',
			'homepage-posts-2',
			'homepage-posts-3',
			'homepage-posts-4',
			'homepage-posts-5',
			'homepage-posts-6',
			'homepage-posts-7',
			'homepage-posts-8',
			'homepage-posts-9',
			'homepage-posts-10',
			'homepage-posts-11',
			'homepage-posts-12',
			'homepage-posts-13',
			'homepage-posts-14',
			'homepage-posts-15',
			'homepage-posts-16',
			'homepage-posts-17',
			'homepage-posts-18',
			'homepage-posts-19',
			'homepage-posts-20',
		);

		// Subscribe
		if ( $mailchimp_available ) {
			array_push(
				$newspack_block_patterns,
				'subscribe-1',
				'subscribe-2',
				'subscribe-3',
				'subscribe-4',
			);
		}

		// Donations
		if ( $donations_configured ) {
			array_push(
				$newspack_block_patterns,
				'donations-1',
				'donations-2',
				'donations-3',
			);
		}

		foreach ( $newspack_block_patterns as $newspack_block_pattern ) {
			register_block_pattern(
				'newspack/' . $newspack_block_pattern,
				require NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/block-patterns/' . $newspack_block_pattern . '.php'
			);
		}
	}

	register_block_pattern_category( 'newspack-donations', array( 'label' => _x( 'Newspack Donations', 'Block pattern category', 'newspack-blocks' ) ) );
	register_block_pattern_category( 'newspack-homepage-posts', array( 'label' => _x( 'Newspack Homepage Posts', 'Block pattern category', 'newspack-blocks' ) ) );
	register_block_pattern_category( 'newspack-subscribe', array( 'label' => _x( 'Newspack Subscribe', 'Block pattern category', 'newspack-blocks' ) ) );
}
add_action( 'init', 'newspack_register_block_patterns_and_categories' );
