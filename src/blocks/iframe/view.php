<?php
/**
 * Server-side rendering of the `newspack-blocks/iframe` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/iframe` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string
 */
function newspack_blocks_render_block_iframe( $attributes ) {
	Newspack_Blocks::enqueue_view_assets( 'iframe' );

	return newspack_blocks_get_iframe( $attributes );
}

/**
 * Registers the `newspack-blocks/iframe` block on server.
 */
function newspack_blocks_register_iframe() {
	register_block_type(
		'newspack-blocks/iframe',
		array(
			'attributes'      => array(
				'src'           => array( 'type' => 'string' ),
				'archiveFolder' => array( 'type' => 'string' ),
				'height'        => array( 'type' => 'string' ),
				'width'         => array( 'type' => 'string' ),
				'isFullScreen'  => array( 'type' => 'boolean' ),
			),
			'render_callback' => 'newspack_blocks_render_block_iframe',
			'supports'        => [],
		)
	);
}
add_action( 'init', 'newspack_blocks_register_iframe' );

/**
 * Get iframe data for general args.
 *
 * @param array $args Arguments. See $defaults.
 * @return array of iframe info.
 */
function newspack_blocks_get_iframe( $args ) {
	$defaults = array(
		'src'          => '',
		'height'       => '600px',
		'width'        => '100%',
		'isFullScreen' => false,
	);
	$args     = wp_parse_args( $args, $defaults );

	return newspack_blocks_get_iframe_html( $args['src'], $args['height'], $args['width'], $args['isFullScreen'] );
}

/**
 * Get embed html for embbed iframe.
 *
 * @param array $src Iframe source.
 * @param array $height Iframe Height.
 * @param array $width Iframe width.
 * @param array $is_full_screen If the Iframe should be rendered full screen.
 * @return string HTML embed.
 */
function newspack_blocks_get_iframe_html( $src, $height, $width, $is_full_screen ) {
	$height = $is_full_screen ? '100' : $height;
	$width  = $is_full_screen ? '100' : $width;
	$style  = "height: $height; width: $width;";
	$layout = 'responsive';

	if ( $is_full_screen ) {
		$layout = 'fill';
		$style  = 'height: 100vh; width: 100vw; max-width: 100vw; max-height: 100vh; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999999; margin-top: 0!important;';
	}

	ob_start();
	?>
	<figure class='wp-block-newspack-blocks-iframe'>
		<div class='wp-block-embed__wrapper'>
			<iframe 
				layout='<?php echo esc_attr( $layout ); ?>''
				height='<?php echo esc_attr( $height ); ?>''
				width='<?php echo esc_attr( $width ); ?>''
				src='<?php echo esc_attr( $src ); ?>'
				style='<?php echo esc_attr( $style ); ?>'
				frameborder='0'
				allowfullscreen
			></iframe>
		</div>
	</figure>
	<?php
	return ob_get_clean();
}
