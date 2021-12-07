<?php
/**
 * Server-side rendering of the `newspack-blocks/donate` block.
 *
 * @package WordPress
 */

/**
 * Renders the `newspack-blocks/donate` block on server.
 *
 * @param array $attributes The block attributes.
 *
 * @return string
 */
function newspack_blocks_render_block_donate( $attributes ) {
	if (
		Donate_Block_Renderer::is_rendering_streamlined_block_in_amp()
	) {
		$iframe_src = PROXY . '/__redirect/' . site_url() . '/?_newspack-render-donate-block-attrs=' . urlencode( wp_json_encode( $attributes ) );
		ob_start();
		?>
			<iframe
				sandbox="allow-scripts allow-same-origin allow-forms"
				height="600"
				src="<?php echo $iframe_src; ?>"
			></iframe>
		<?php
		return ob_get_clean();
	}

	if ( Newspack_Blocks::is_rendering_streamlined_block() ) {
		$script_data = Donate_Block_Renderer::get_streamlined_version_js_script_data();
		wp_enqueue_script(
			Newspack_Blocks::DONATE_STREAMLINED_SCRIPT_HANDLE,
			$script_data['script_path'],
			[ 'wp-i18n' ],
			$script_data['version'],
			true
		);
		wp_enqueue_style(
			Newspack_Blocks::DONATE_STREAMLINED_SCRIPT_HANDLE,
			Donate_Block_Renderer::get_streamlined_version_css_path(),
			[],
			NEWSPACK_BLOCKS__VERSION
		);
	}
	Newspack_Blocks::enqueue_view_assets( 'donate' );

	$block_html = Donate_Block_Renderer::render_block_content( $attributes );
	return apply_filters( 'newspack_blocks_donate_block_html', $block_html, $attributes );
}

/**
 * Registers the `newspack-blocks/donate` block on server.
 */
function newspack_blocks_register_donate() {
	register_block_type(
		'newspack-blocks/donate',
		array(
			'attributes'      => array(
				'className'               => [
					'type' => 'string',
				],
				'manual'                  => [
					'type' => 'boolean',
				],
				'suggestedAmounts'        => [
					'type'    => 'array',
					'items'   => [
						'type' => 'number',
					],
					'default' => [ 0, 0, 0 ],
				],
				'suggestedAmountUntiered' => [
					'type' => 'number',
				],
				'tiered'                  => [
					'type'    => 'boolean',
					'default' => true,
				],
				'campaign'                => [
					'type' => 'string',
				],
				'thanksText'              => [
					'type'    => 'string',
					'default' => __( 'Your contribution is appreciated.', 'newspack-blocks' ),
				],
				'buttonText'              => [
					'type'    => 'string',
					'default' => __( 'Donate now!', 'newspack-blocks' ),
				],
				'defaultFrequency'        => [
					'type'    => 'string',
					'default' => 'month',
				],
			),
			'render_callback' => 'newspack_blocks_render_block_donate',
			'supports'        => [],
		)
	);
}
add_action( 'init', 'newspack_blocks_register_donate' );
