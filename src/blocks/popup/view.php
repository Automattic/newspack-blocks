<?php
/**
 * Server-side rendering of the `newspack-blocks/popup` block.
 *
 * @package WordPress
 */

/**
 * The number of times the pop-up should be displayed.
 */
define( 'NEWSPACK_BLOCKS_POPUP_VIEW_LIMIT', 1 );

/**
 * Renders the `newspack-blocks/popup` block on server.
 *
 * @param array  $attributes The block attributes.
 * @param string $content The block content.
 *
 * @return string
 */
function newspack_blocks_render_block_popup( $attributes, $content ) {
	// Only display popups for logged-out users viewing an article.
	if ( is_user_logged_in() || ! is_single() ) {
		return '<!-- Newspack pop-up suppressed -->';
	}

	// The ID must be randomized. If there are two popups with the same ID on a page, only one pop-up will be able to close.
	$element_id = 'lightbox' . rand(); // phpcs:ignore WordPress.WP.AlternativeFunctions.rand_rand

	ob_start();
	?>
	<div amp-access="displayPopup" amp-access-hide class="lightbox" role="button" tabindex="0" id="<?php echo esc_attr( $element_id ); ?>">
		<div class="wp-block-newspack-blocks-popup">
			<?php echo $content; ?>
		</div>
		<button on="tap:<?php echo esc_attr( $element_id ); ?>.hide" class="lightbox-close">x</button>
	</div>
	<div id="marker">
		<amp-position-observer on="enter:showAnim.start;" once layout="nodisplay" />
	</div>
	<amp-animation id="showAnim" layout="nodisplay">
		<script type="application/json">
			{
				"duration": "0",
				"fill": "both",
				"iterations": "1",
				"direction": "alternate",
				"animations": [{
					"selector": ".lightbox",
					"keyframes": [{
						"transform": "translateX( 0 )",
						"visibility": "visible"
					}]
				}]
			}
		</script>
	</amp-animation>
	<?php
	Newspack_Blocks::enqueue_view_assets( 'popup' );
	wp_enqueue_script( 'amp-animation' );
	wp_enqueue_script( 'amp-position-observer' );
	return ob_get_clean();
}

/**
 * Add amp-access header code.
 */
function newspack_blocks_popup_access() {
	$endpoint = str_replace( 'http://', '//', get_rest_url( null, 'newspack-blocks/v1/reader' ) );
	?>
	<script id="amp-access" type="application/json">
		{
			"authorization": "<?php echo esc_url( $endpoint ); ?>?rid=READER_ID&url=CANONICAL_URL&RANDOM",
			"pingback": "<?php echo esc_url( $endpoint ); ?>?rid=READER_ID&url=CANONICAL_URL&RANDOM",
			"authorizationFallbackResponse": {
				"displayPopup": true
			}
		}
	</script>
	<?php
	wp_enqueue_script( 'amp-access' );
	wp_enqueue_script( 'amp-analytics' );
}
add_action( 'wp_head', 'newspack_blocks_popup_access' );

/**
 * Register the 'reader' endpoint used by amp-access.
 */
function newspack_blocks_popup_register_reader_endpoint() {
	register_rest_route(
		'newspack-blocks/v1/',
		'reader',
		array(
			'methods'  => 'GET',
			'callback' => 'newspack_blocks_popup_reader_get_endpoint',
		)
	);
	register_rest_route(
		'newspack-blocks/v1/',
		'reader',
		array(
			'methods'  => 'POST',
			'callback' => 'newspack_blocks_popup_reader_post_endpoint',
		)
	);
}
add_action( 'rest_api_init', 'newspack_blocks_popup_register_reader_endpoint' );

/**
 * Handle GET requests to the reader endpoint.
 *
 * @param WP_REST_Request $request amp-access request.
 * @return WP_REST_Response with info about reader.
 */
function newspack_blocks_popup_reader_get_endpoint( $request ) {
	$reader   = isset( $request['rid'] ) ? $request['rid'] : false;
	$response = array(
		'currentViews' => 0,
		'displayPopup' => true,
	);

	if ( ! $reader ) {
		return rest_ensure_response( $response );
	}

	$response['currentViews'] = (int) get_transient( $reader . '-currentViews' );
	$response['displayPopup'] = $response['currentViews'] < NEWSPACK_BLOCKS_POPUP_VIEW_LIMIT;
	return rest_ensure_response( $response );
}

/**
 * Handle POST requests to the reader endpoint.
 *
 * @param WP_REST_Request $request amp-access request.
 * @return WP_REST_Response with updated info about reader.
 */
function newspack_blocks_popup_reader_post_endpoint( $request ) {
	$reader = isset( $request['rid'] ) ? sanitize_title( $request['rid'] ) : false;
	$url    = isset( $request['url'] ) ? esc_url_raw( $request['url'] ) : false;

	if ( $reader && $url ) {
		$post_id = url_to_postid( $url );
		if ( $post_id && 'post' === get_post_type( $post_id ) ) {
			$current_views = (int) get_transient( $reader . '-currentViews' );
			set_transient( $reader . '-currentViews', $current_views + 1, WEEK_IN_SECONDS );
		}
	}

	return newspack_blocks_popup_reader_get_endpoint( $request );
}

/**
 * Registers the `newspack-blocks/popup` block on server.
 */
function newspack_blocks_register_popup() {
	register_block_type(
		'newspack-blocks/popup',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_popup',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_popup' );
