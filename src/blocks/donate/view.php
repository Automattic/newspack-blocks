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
	if ( ! class_exists( 'Newspack\Configuration_Managers' ) ) {
		return '';
	}

	Newspack_Blocks::enqueue_view_assets( 'donate' );

	$configuration_manager = Newspack\Configuration_Managers::configuration_manager_class_for_plugin_slug( 'woocommerce' );
	$settings = $configuration_manager->get_donation_settings();

	$frequencies = [
		'once' => __( 'One-time', 'newspack' ),
		'month' => __( 'Monthly', 'newspack' ),
		'year' => __( 'Anually', 'newspack' ),
	];

	$selected_frequency = 'month';

	$suggested_amounts = [
		$settings['suggestedAmountLow'],
		$settings['suggestedAmount'],
		$settings['suggestedAmountHigh'],
	];

	ob_start();
	?>
	<div class='newspack-blocks-donate'>
		<form>
			<input type='hidden' name='newspack_donate' value='1' />
			<div class='newspack-blocks-donate__options'>
				<div class='newspack-blocks-donate__frequencies'>
					<?php foreach ( $frequencies as $frequency_slug => $frequency_name ): ?>
						<div class='newspack-blocks-donate__frequency'>
							<?php $esc_slug = esc_attr( $frequency_slug ); ?>
							<input type='radio' value='<?php echo $esc_slug ?>' id='newspack-donate-<?php echo $esc_slug ?>' name='donation_frequency' <?php checked( $selected_frequency, $frequency_slug ) ?> />
							<label for='newspack-donate-<?php echo $esc_slug ?>' class='donation-frequency-label'><?php echo esc_html( $frequency_name ); ?></label>
							<div class='newspack-blocks-donate__tiers'>
								<?php foreach ( $suggested_amounts as $index => $suggested_amount ): ?>
									<div class='newspack-blocks-donate__tier'>
										<?php $amount = 'year' === $frequency_slug ? 12 * $suggested_amount : $suggested_amount; ?>
										<input type='radio' name='donation_value_<?php echo $esc_slug ?>' value='<?php echo esc_attr( floatval( $amount ) ) ?>' id='newspack-tier-<?php echo $esc_slug ?>-<?php echo (int) $index ?>' <?php checked( 1, $index ) ?> />
										<label class='tier-select-label' for='newspack-tier-<?php echo $esc_slug ?>-<?php echo (int) $index ?>'><?php echo esc_html( $amount ); ?></label>
									</div>
								<?php endforeach; ?>
								<div class='newspack-blocks-donate__tier'>
									<?php $amount = 'year' === $frequency_slug ? 12 * $suggested_amounts[1] : $suggested_amounts[1]; ?>
									<input type='radio' class='other-input' name='donation_value_<?php echo $esc_slug ?>' value='other' id='newspack-tier-<?php echo $esc_slug ?>-other' />
									<label class='tier-select-label' for='newspack-tier-<?php echo $esc_slug ?>-other'><?php echo esc_html__( 'Other', 'newspack' ); ?></label>
									<label class='other-donate-label' for='newspack-tier-<?php echo $esc_slug ?>-other-input'><?php echo esc_html__( 'Other amount', 'newspack' ); ?></label>
									<input type='number' name='donation_value_<?php echo $esc_slug ?>_other' value='<?php echo esc_attr( $amount ) ?>' id='newspack-tier-<?php echo $esc_slug ?>-other-input' />
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			<p class='newspack-blocks-donate__thanks'><?php echo esc_html__( 'Your contribution is appreciated.', 'newspack' ); ?></p>
			<button type='submit'><?php echo esc_html__( 'Donate now!', 'newspack' ); ?></button>
		</form>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Registers the `newspack-blocks/donate` block on server.
 */
function newspack_blocks_register_donate() {
	register_block_type(
		'newspack-blocks/donate',
		array(
			'attributes'      => array(
				'className' => array(
					'type' => 'string',
				),
			),
			'render_callback' => 'newspack_blocks_render_block_donate',
		)
	);
}
add_action( 'init', 'newspack_blocks_register_donate' );
