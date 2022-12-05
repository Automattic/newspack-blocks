<?php
/**
 * Renders the tiers-based Donate block.
 *
 * @package WordPress
 */

defined( 'ABSPATH' ) || exit;

require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/donate/frontend/class-newspack-blocks-donate-renderer-base.php';

/**
 * Renders the tiers-based Donate block.
 */
class Newspack_Blocks_Donate_Renderer_Tiers_Based extends Newspack_Blocks_Donate_Renderer_Base {
	/**
	 * Get frequency label.
	 *
	 * @param string $frequency_slug Frequency slug.
	 */
	private static function get_frequency_label( $frequency_slug ) {
		switch ( $frequency_slug ) {
			case 'once':
				return __( '/once', 'newspack-blocks' );
			case 'month':
				return __( '/month', 'newspack-blocks' );
			case 'year':
				return __( '/year', 'newspack-blocks' );
		}
	}

	/**
	 * Get displayed amounts.
	 *
	 * @param array $amounts Amounts.
	 */
	private static function get_displayed_amounts( $amounts ) {
		$disabled_in_tiers_based_layout_tier_index = 3;
		return array_slice( $amounts, 0, $disabled_in_tiers_based_layout_tier_index );
	}

	/**
	 * Render the single option.
	 *
	 * @param array  $attributes Block attributes.
	 * @param int    $index Option index.
	 * @param int    $amount Option amount.
	 * @param string $selected_frequency Selected frequency.
	 */
	private static function render_single_tier( $attributes, $index, $amount, $selected_frequency ) {
		$configuration = self::get_configuration( $attributes );

		$button_style_attr = 'style="' . self::get_button_style( $attributes ) . '"';

		ob_start();
		?>
		<div class="wpbnbd__tiers__tier">
			<div class="wpbnbd__tiers__heading">
				<?php echo esc_html( $attributes['tiersBasedOptions'][ $index ]['heading'] ); ?>
			</div>
			<div class="wpbnbd__tiers__amount">
				<span>
					<?php foreach ( $configuration['frequencies'] as $frequency_slug => $frequency_name ) : ?>
						<span
							style="<?php echo $frequency_slug === $selected_frequency ? '' : 'display:none;'; ?>"
							data-frequency-slug="<?php echo esc_attr( $frequency_slug ); ?>"
							data-amount="<?php echo esc_attr( $configuration['amounts'][ $frequency_slug ][ $index ] ); ?>"
							data-tier-index="<?php echo esc_attr( $index ); ?>"
						>
							<span class="wpbnbd__tiers__amount__number"><?php echo esc_html( $configuration['currencySymbol'] ); ?><?php echo esc_html( $configuration['amounts'][ $frequency_slug ][ $index ] ); ?></span><span class="wpbnbd__tiers__amount__frequency"><?php echo esc_html( self::get_frequency_label( $frequency_slug ) ); ?></span>
						</span>
					<?php endforeach; ?>
				</span>
			</div>
			<button
				type='submit'
				name="<?php echo esc_attr( self::TIER_PARAM_PREFIX ); ?><?php echo esc_attr( $selected_frequency ); ?>"
				value="<?php echo esc_attr( $configuration['amounts'][ $selected_frequency ][ $index ] ); ?>"
				data-tier-index="<?php echo esc_attr( $index ); ?>"
				<?php echo $button_style_attr; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			>
				<?php echo esc_html( $attributes['tiersBasedOptions'][ $index ]['buttonText'] ); ?>
			</button>
			<div class="wpbnbd__tiers__description">
				<?php echo wp_kses_post( $attributes['tiersBasedOptions'][ $index ]['description'] ); ?>
			</div>
		</div>

		<?php
		return ob_get_clean();
	}

	/**
	 * Render the tiers-based layout.
	 *
	 * @param array $attributes Block attributes.
	 */
	public static function render( $attributes ) {
		$configuration = self::get_configuration( $attributes );

		$intial_selected_frequency  = 'month';
		$intial_selected_tier_index = 0;
		$displayed_amounts          = self::get_displayed_amounts( $configuration['amounts'][ $intial_selected_frequency ] );

		$configuration_for_tiers_based = [
			self::FREQUENCY_PARAM,
			self::TIER_PARAM_PREFIX,
			$intial_selected_frequency,
			$attributes['tiersBasedOptions'],
			$configuration['amounts'],
			( new DateTime() )->modify( '+1 month' )->format( 'F d, Y' ),
			( new DateTime() )->modify( '+1 year' )->format( 'F d, Y' ),
			$configuration['is_rendering_stripe_payment_form'],
			$attributes['buttonColor'],
		];

		ob_start();
		?>
		<div
			class="<?php echo esc_html( $configuration['container_classnames'] ); ?>"
			data-streamlined-config="<?php echo esc_html( htmlspecialchars( wp_json_encode( $configuration['configuration_for_streamlined'] ), ENT_QUOTES, 'UTF-8' ) ); ?>"
			data-tiers-based-config="<?php echo esc_html( htmlspecialchars( wp_json_encode( $configuration_for_tiers_based ), ENT_QUOTES, 'UTF-8' ) ); ?>"
		>
			<form data-is-init-form>
				<div class="wpbnbd__tiers__view">
					<?php echo self::render_donate_form_input(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<input type="hidden" name="<?php echo esc_attr( self::FREQUENCY_PARAM ); ?>" value="<?php echo esc_attr( $intial_selected_frequency ); ?>">
					<div class="wpbnbd__tiers">
						<div class="wpbnbd__tiers__selection">
							<?php foreach ( $configuration['frequencies'] as $frequency_slug => $frequency_name ) : ?>
								<button
									type="button"
									data-frequency-slug="<?php echo esc_attr( $frequency_slug ); ?>"
									data-frequency-label="<?php echo esc_attr( self::get_frequency_label( $frequency_slug ) ); ?>"
									class="wpbnbd__button <?php echo $intial_selected_frequency === $frequency_slug ? 'wpbnbd__button--active' : ''; ?>"
								><?php echo esc_html( $frequency_name ); ?></button>
							<?php endforeach; ?>
						</div>
						<div class="wpbnbd__tiers__options">
							<?php foreach ( $displayed_amounts as $index => $amount ) : ?>
								<?php
									echo self::render_single_tier( $attributes, $index, $amount, $intial_selected_frequency ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
								?>
							<?php endforeach; ?>
						</div>
						<ul class="wpbnbd__tiers__options__dots">
							<?php foreach ( $displayed_amounts as $index => $amount ) : ?>
								<li></li>
							<?php endforeach; ?>
						</ul>
					</div>
				</div>

			</form>
			<?php if ( $configuration['is_rendering_stripe_payment_form'] ) : ?>
				<div class="wpbnbd__tiers__view wpbnbd__tiers__view--hidden">
				<form data-is-streamlined-form>
					<button class="wpbnbd__tiers__back-button">← <span><?php echo esc_html( __( 'Back', 'newspack-blocks' ) ); ?></span></button>
					<div class="wpbnbd__tiers__tier-tile">
						<h2>
							<?php echo esc_html( $attributes['tiersBasedOptions'][ $intial_selected_tier_index ]['heading'] ); ?>
						</h2>
						<div>
							<div>
								<span><?php echo esc_html( $configuration['currencySymbol'] ); ?></span>
								<span data-amount><?php echo esc_html( $configuration['amounts'][ $intial_selected_frequency ][ $intial_selected_tier_index ] ); ?></span>
								<span data-frequency><?php echo esc_html( self::get_frequency_label( $intial_selected_frequency ) ); ?></span>
							</div>
							<div class="wpbnbd__tiers__tier-tile__note">
								<?php echo esc_html( __( 'Renews on', 'newspack-blocks' ) ); ?> <span data-renews-date>-</span>
							</div>
						</div>
					</div>
					<?php echo self::render_streamlined_payment_ui( $attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					<input data-is-streamlined-input-amount type="hidden" name="" value="0">
					<input type="hidden" name="<?php echo esc_attr( self::FREQUENCY_PARAM ); ?>" value="<?php echo esc_attr( $intial_selected_frequency ); ?>">
					<?php echo self::render_client_id_form_input(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				</div>
				</form>
			<?php endif; ?>
		</div>

		<?php
		return apply_filters( 'newspack_blocks_donate_block_html', ob_get_clean(), $attributes );
	}
}
