<?php
/**
 * Newspack block patterns
 *
 * @package Newspack_Blocks
 */

/**
 * Registers block patterns and categories.
 *
 * @package Newspack_Blocks
 */
function newspack_blocks_register_block_patterns_and_categories() {
	/*
	* Register block patterns.
	*/
	if ( function_exists( 'register_block_pattern' ) ) {
		/*
		 * Check if donations have been configured.
		 * If not, we won't show the Donations patterns.
		 */
		$donations_configured = false;
		if ( class_exists( 'Newspack\Donations' ) ) {
			$settings = Newspack\Donations::get_donation_settings();
			if ( ! is_wp_error( $settings ) && $settings['created'] ) {
				$donations_configured = true;
			}
		}

		$block_patterns = array();

		// Donations.
		if ( $donations_configured ) {
			array_push(
				$block_patterns,
				'donations-1',
				'donations-2',
				'donations-3'
			);
		}

		// Homepage Posts.
		array_push(
			$block_patterns,
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
			'homepage-posts-20'
		);

		// Subscribe.
		array_push(
			$block_patterns,
			'subscribe-1',
			'subscribe-2',
			'subscribe-3',
			'subscribe-4'
		);

		foreach ( $block_patterns as $block_pattern ) {
			register_block_pattern(
				'newspack/' . $block_pattern,
				require NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/block-patterns/' . $block_pattern . '.php'
			);
		}
	}

	/*
	* Register block pattern categories.
	*/
	if ( function_exists( 'register_block_pattern_category' ) ) {
		register_block_pattern_category(
			'newspack-donations',
			array( 'label' => __( 'Newspack Donations', 'newspack-blocks' ) )
		);
		register_block_pattern_category(
			'newspack-homepage-posts',
			array( 'label' => __( 'Newspack Homepage Posts', 'newspack-blocks' ) )
		);
		register_block_pattern_category(
			'newspack-subscribe',
			array( 'label' => __( 'Newspack Subscribe', 'newspack-blocks' ) )
		);
	}
}
add_action( 'init', 'newspack_blocks_register_block_patterns_and_categories' );
