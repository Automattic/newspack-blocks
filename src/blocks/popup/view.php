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
