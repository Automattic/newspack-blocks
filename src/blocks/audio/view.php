<?php
/**
 * Server-side helpers for the `newspack-blocks/audio` block.
 *
 * @package WordPress
 */

/**
 * Enqueues assets for the audio block
 */
function newspack_blocks_audio_block_assets(  ) {
  Newspack_Blocks::enqueue_view_assets( 'audio' );
}

add_action( 'wp_footer', 'newspack_blocks_audio_block_assets' );
