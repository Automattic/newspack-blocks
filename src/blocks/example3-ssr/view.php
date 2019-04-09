<?php
/**
 * Server-side rendering of the `newspack-blocks/example2-attributes` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/example2-attributes` block on server.
 *
 * @param array  $attributes The block attributes.
 * @param string $content The block content.
 *
 * @return string Returns the post content with latest posts added.
 */
function newspack_blocks_render_block_example3_ssr( $attributes, $content ) {
	$classes = Newspack_Blocks::block_classes( 'example3-ssr', $attributes );
	$today   = date( 'm/d/Y h:i:s a', time() );
	ob_start();
	?>
	<div class="<?php echo esc_attr( $classes ); ?>">
		<p><?php echo wp_kses_post( $today ); ?></p>
	</div>
	<?php
	$content = ob_get_clean();

	Newspack_Blocks::enqueue_view_assets( 'example3-ssr' );
	return $content;
}

/**
 * Registers the `newspack-blocks/homepage-articles` block on server.
 */
register_block_type(
	'newspack-blocks/example3-ssr',
	array(
		'render_callback' => 'newspack_blocks_render_block_example3_ssr',
	)
);
