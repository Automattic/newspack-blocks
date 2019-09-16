<?php
/**
 * Server-side rendering of the `newspack-blocks/popup` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/popup` block on server.
 *
 * @param array  $attributes The block attributes.
 * @param string $content The block content.
 *
 * @return string
 */
function newspack_blocks_render_block_popup( $attributes, $content ) {
	if ( ! is_single() ) {
		return '<!-- Newspack pop-up suppressed -->';
	}

	if ( newspack_blocks_popup_get_user_visits() > 1000 ) {
		return '<!-- Newspack pop-up already seen -->';
	}

	ob_start();
	?>
	<div class="lightbox" role="button" tabindex="0" id="lightbox1">
		<div class="wp-block-newspack-blocks-popup">
			<?php echo $content; ?>
		</div>
		<button on="tap:lightbox1.hide" class="lightbox-close">x</button>
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

/**
 * Return the number of times the user has visited the site (for determining whether to show pop-ups).
 *
 * @return int The number of times.
 */
function newspack_blocks_popup_get_user_visits() {
	return (int) filter_input( INPUT_COOKIE, 'newspack_blocks_popup_user_visits', FILTER_SANITIZE_NUMBER_INT );
}

/**
 * Increment the visit count.
 */
function newspack_blocks_popup_record_user_visit() {
	if ( ! is_singular() ) {
		return;
	}

	$num_visits = (int) newspack_blocks_popup_get_user_visits();
	setcookie( 'newspack_blocks_popup_user_visits', 1 + $num_visits, time() + WEEK_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl() );
}
add_action( 'wp', 'newspack_blocks_popup_record_user_visit' );
