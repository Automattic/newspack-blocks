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
					<?php echo esc_html( $configuration['currencySymbol'] ); ?>
					<?php foreach ( $configuration['frequencies'] as $frequency_slug => $frequency_name ) : ?>
						<span
							style="<?php echo $frequency_slug === $selected_frequency ? '' : 'display:none;'; ?>"
							data-frequency-slug="<?php echo esc_attr( $frequency_slug ); ?>"
							data-amount="<?php echo esc_attr( $configuration['amounts'][ $frequency_slug ][ $index ] ); ?>"
							data-tier-index="<?php echo esc_attr( $index ); ?>"
						>
							<span class="wpbnbd__tiers__amount__number"><?php echo esc_html( $configuration['amounts'][ $frequency_slug ][ $index ] ); ?></span>
							<span><?php echo esc_html( self::get_frequency_label( $frequency_slug ) ); ?></span>
						</span>
					<?php endforeach; ?>
				</span>
			</div>
			<div class="wpbnbd__tiers__description">
				<?php echo wp_kses_post( $attributes['tiersBasedOptions'][ $index ]['description'] ); ?>
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

		$intial_selected_frequency = 'month';
		$displayed_amounts         = self::get_displayed_amounts( $configuration['amounts'][ $intial_selected_frequency ] );

		ob_start();
		?>
		<form
			class="<?php echo esc_html( $configuration['container_classnames'] ); ?>"
			data-param-freq="<?php echo esc_attr( self::FREQUENCY_PARAM ); ?>"
			data-param-tier-prefix="<?php echo esc_attr( self::TIER_PARAM_PREFIX ); ?>"
			data-init-frequency="<?php echo esc_attr( $intial_selected_frequency ); ?>"
		>
			<?php echo self::render_donate_form_input(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			<input type="hidden" name="<?php echo esc_attr( self::FREQUENCY_PARAM ); ?>" value="<?php echo esc_attr( $intial_selected_frequency ); ?>">
			<div class="wpbnbd__tiers">
				<div class="wpbnbd__tiers__selection">
					<?php foreach ( $configuration['frequencies'] as $frequency_slug => $frequency_name ) : ?>
						<button
							type="button"
							data-frequency-slug="<?php echo esc_attr( $frequency_slug ); ?>"
							class="wpbnbd__tiers__selection__item <?php echo $intial_selected_frequency === $frequency_slug ? 'wpbnbd__tiers__selection__item--active' : ''; ?>"
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
			</div>
			<?php echo self::render_client_id_form_input(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</form>
		<?php
		return apply_filters( 'newspack_blocks_donate_block_html', ob_get_clean(), $attributes );
	}
}
