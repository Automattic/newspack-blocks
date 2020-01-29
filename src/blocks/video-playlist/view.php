<?php
/**
 * Server-side rendering of the `newspack-blocks/video-playlist` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/video-playlist` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string
 */
function newspack_blocks_render_block_video_playlist( $attributes ) {
	Newspack_Blocks::enqueue_view_assets( 'video-playlist' );

	$videos = newspack_blocks_get_video_playlist( $attributes );
	return $videos['html'];
}

/**
 * Registers the `newspack-blocks/donate` block on server.
 */
function newspack_blocks_register_video_playlist() {
	register_block_type(
		'newspack-blocks/video-playlist',
		array(
			'attributes'      => array(
				'className'               => [
					'type' => 'string',
				],
				'manual'                  => [
					'type' => 'boolean',
				],
				'videos'        => [
					'type'    => 'array',
					'default' => [],
				],
				'categories' => [
					'type' => 'array',
					'default' => [],
				],
			),
			'render_callback' => 'newspack_blocks_render_block_video_playlist',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_video_playlist' );

function newspack_blocks_get_video_playlist( $args ) {
	$defaults = [
		'categories' => [],
		'videos'     => [],
		'limit'      => 5,
	];
	$args = wp_parse_args( $args, $defaults );

	if ( $args['videos'] ) {
		$videos = array_map( 'esc_url_raw', $args['videos'] );
	} else {
		$videos = newspack_blocks_get_video_playlist_videos( $args );
	}

	$html = '';
	if ( $videos ) {
		$html = newspack_blocks_get_video_playlist_html( $videos );
	}

	return [
		'videos' => $videos,
		'html'   => $html,
	];
}

function newspack_blocks_get_video_playlist_videos( $args ) {
	$defaults = [
		'categories' => [],
		'limit' => 5,
	];
	$args = wp_parse_args( $args, $defaults );

	$query_args = [
		'post_type'      => 'post',
		'post_status'    => 'publish',
		's'              => 'core-embed/youtube',
		'posts_per_page' => $args['limit'],
	];

	$videos = [];
	$posts  = get_posts( $query_args );
	foreach ( $posts as $post ) {
		$blocks = parse_blocks( $post->post_content );
		$youtube_blocks = array_filter( $blocks, function( $blocks ) {
			return 'core-embed/youtube' === $blocks['blockName'];
		} );
		foreach ( $youtube_blocks as $youtube_block ) {
			$videos[] = $youtube_block['attrs']['url'];
		}
	}

	return array_slice( array_unique( $videos ), 0, $args['limit'] );
}

function newspack_blocks_get_video_playlist_html( $videos ) {
	$video_ids = [];
	foreach ( $videos as $video ) {
		$url_parts = wp_parse_url( $video );
		if ( empty( $url_parts['query'] ) ) {
			continue;
		}

		wp_parse_str( $url_parts['query'], $query_parts );
		if ( ! empty( $query_parts['v'] ) ) {
			$video_ids[] = $query_parts['v'];
		}
	}

	if ( empty( $video_ids ) ) {
		return '';
	}

	$url = 'https://www.youtube.com/embed/' . $video_ids[0] . '?rel=0&showinfo=1';
	if ( count( $video_ids ) > 1 ) {
		$url .= '&playlist=' . implode( ',', array_slice( $video_ids, 1 ) );
	}

	ob_start();
	?>
	<iframe width="560" height="315" src="<?php echo esc_attr( $url ); ?>" frameborder="0" allowfullscreen></iframe>
	<?php
	return ob_get_clean();
}