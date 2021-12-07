<?php
/**
 * Newspack Donation Block rendering.
 *
 * @package Newspack
 */

defined( 'ABSPATH' ) || exit;

/**
 * Donate Block Renderer.
 */
class Donate_Block_Renderer {
	/**
	 * Add hooks and filters.
	 */
	public static function init() {
		add_filter( 'wp', [ __CLASS__, 'display_donate_block_frame' ] );
	}

	/**
	 * Renders the footer of the donation form.
	 *
	 * @param array $attributes The block attributes.
	 *
	 * @return string
	 */
	public static function render_footer( $attributes ) {
		$is_streamlined                      = Newspack_Blocks::is_rendering_streamlined_block();
		$is_rendering_newsletter_list_opt_in = false;
		if ( $is_streamlined ) {
			$payment_data = WP_REST_Newspack_Donate_Controller::get_payment_data();
			if ( class_exists( 'Newspack_Newsletters' ) ) {
				$is_rendering_newsletter_list_opt_in = isset( $payment_data['newsletter_list_id'] ) && ! empty( $payment_data['newsletter_list_id'] );
			}
		}
		$thanks_text = $attributes['thanksText'];
		$button_text = $attributes['buttonText'];
		$campaign    = $attributes['campaign'] ?? false;
		$client_id   = '';
		if ( class_exists( 'Newspack_Popups_Segmentation' ) ) {
			$client_id = Newspack_Popups_Segmentation::NEWSPACK_SEGMENTATION_CID_NAME;
		}

		ob_start();

		?>
		<p class='wp-block-newspack-blocks-donate__thanks thanks'>
			<?php echo wp_kses_post( $thanks_text ); ?>
		</p>

		<?php if ( $is_streamlined ) : ?>
			<div class="wp-block-newspack-blocks-donate__stripe stripe-payment stripe-payment--disabled" data-stripe-pub-key="<?php echo esc_attr( $payment_data['usedPublishableKey'] ); ?>">
				<div class="stripe-payment__inputs <?php self::is_rendering_streamlined_block_in_amp() ? '' : 'stripe-payment__inputs--hidden' ?>">
					<div class="stripe-payment__row">
						<div class="stripe-payment__card"></div>
					</div>
					<div class="stripe-payment__row stripe-payment__row--flex">
						<input required placeholder="<?php echo esc_html__( 'Email', 'newspack-blocks' ); ?>" type="email" name="email" value="">
						<input required placeholder="<?php echo esc_html__( 'Full Name', 'newspack-blocks' ); ?>" type="text" name="full_name" value="">
					</div>
					<?php if ( $is_rendering_newsletter_list_opt_in ) : ?>
						<div class="stripe-payment__row">
							<label class="stripe-payment__checkbox">
								<input type="checkbox" name="newsletter_opt_in" checked value="true"><?php echo esc_html__( 'Sign up for our newsletter', 'newspack-blocks' ); ?>
							</label>
						</div>
					<?php endif; ?>
					<div class="stripe-payment__messages">
						<div class="type-error"></div>
						<div class="type-success"></div>
						<div class="type-info"></div>
					</div>
				</div>
				<div class="stripe-payment__row stripe-payment__row--flex stripe-payment__footer">
					<button type='submit' style="margin-left: 0; margin-top: 1em;">
						<?php echo wp_kses_post( $button_text ); ?>
					</button>
					<a target="_blank" rel="noreferrer" class="stripe-payment__branding" href="https://stripe.com">
						<img width="111" height="26" src="<?php echo esc_attr( Newspack_Blocks::streamlined_block_stripe_badge() ); ?>" alt="Stripe">
					</a>
				</div>
			</div>
		<?php else : ?>
			<button type='submit'>
				<?php echo wp_kses_post( $button_text ); ?>
			</button>
		<?php endif; ?>
		<?php if ( $campaign ) : ?>
			<input type='hidden' name='campaign' value='<?php echo esc_attr( $campaign ); ?>' />
		<?php endif; ?>
		<input
			name="cid"
			type="hidden"
			value="CLIENT_ID(<?php echo esc_attr( $client_id ); ?>)"
			data-amp-replace="CLIENT_ID"
		/>
		<?php

		return ob_get_clean();
	}

	/**
	 * Render Donate block content.
	 *
	 * @param array $attributes The block attributes.
	 *
	 * @return string
	 */
	public static function render_block_content( $attributes ) {
		if ( ! class_exists( 'Newspack\Donations' ) ) {
			return '';
		}

		$settings = Newspack\Donations::get_donation_settings();
		if ( is_wp_error( $settings ) || ! $settings['created'] ) {
			return '';
		}

		/* If block is in "manual" mode, override certain state properties with values stored in attributes */
		if ( $attributes['manual'] ?? false ) {
			$settings = array_merge( $settings, $attributes );
		}

		$frequencies = [
			'once'  => __( 'One-time', 'newspack-blocks' ),
			'month' => __( 'Monthly', 'newspack-blocks' ),
			'year'  => __( 'Annually', 'newspack-blocks' ),
		];

		$selected_frequency = $attributes['defaultFrequency'] ?? 'month';
		$suggested_amounts  = $settings['suggestedAmounts'];

		$uid = wp_rand( 10000, 99999 ); // Unique identifier to prevent labels colliding with other instances of Donate block.

		$form_footer = self::render_footer( $attributes );

		ob_start();

		/**
		 * For AMP-compatibility, the donation forms are implemented as pure HTML forms (no JS).
		 * Each frequency and tier option is a radio input, styled to look like a button.
		 * As the radio inputs are checked/unchecked, fields are hidden/displayed using only CSS.
		 */
		if ( ! $settings['tiered'] ) :

		?>
		<div class='wp-block-newspack-blocks-donate wpbnbd untiered'>
			<form>
				<input type='hidden' name='newspack_donate' value='1' />
				<div class='wp-block-newspack-blocks-donate__options'>
					<?php foreach ( $frequencies as $frequency_slug => $frequency_name ) : ?>
						<?php
							$amount           = 'year' === $frequency_slug || 'once' === $frequency_slug ? 12 * $settings['suggestedAmountUntiered'] : $settings['suggestedAmountUntiered'];
							$formatted_amount = number_format( $amount, floatval( $amount ) - intval( $amount ) ? 2 : 0 );
						?>

						<div class='wp-block-newspack-blocks-donate__frequency frequency'>
							<input
								type='radio'
								value='<?php echo esc_attr( $frequency_slug ); ?>'
								id='newspack-donate-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>'
								name='donation_frequency'
								<?php checked( $selected_frequency, $frequency_slug ); ?>
							/>
							<label
								for='newspack-donate-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>'
								class='donation-frequency-label freq-label'
							>
								<?php echo esc_html( $frequency_name ); ?>
							</label>
							<div class='input-container'>
								<label
									class='donate-label'
									for='newspack-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-untiered-input'
								>
									<?php echo esc_html__( 'Donation amount', 'newspack-blocks' ); ?>
								</label>
								<div class='wp-block-newspack-blocks-donate__money-input money-input'>
									<span class='currency'>
										<?php echo esc_html( $settings['currencySymbol'] ); ?>
									</span>
									<input
										type='number'
										name='donation_value_<?php echo esc_attr( $frequency_slug ); ?>_untiered'
										value='<?php echo esc_attr( $formatted_amount ); ?>'
										id='newspack-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-untiered-input'
									/>
								</div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
					<?php echo $form_footer; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</form>
		</div>

		<?php
			else :
		?>

		<div class='wp-block-newspack-blocks-donate wpbnbd tiered'>
			<form>
				<input type='hidden' name='newspack_donate' value='1' />
				<div class='wp-block-newspack-blocks-donate__options'>
					<div class='wp-block-newspack-blocks-donate__frequencies frequencies'>
						<?php foreach ( $frequencies as $frequency_slug => $frequency_name ) : ?>

							<div class='wp-block-newspack-blocks-donate__frequency frequency'>
								<input
									type='radio'
									value='<?php echo esc_attr( $frequency_slug ); ?>'
									id='newspack-donate-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>'
									name='donation_frequency'
									<?php checked( $selected_frequency, $frequency_slug ); ?>
								/>
								<label
									for='newspack-donate-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>'
									class='donation-frequency-label freq-label'
								>
									<?php echo esc_html( $frequency_name ); ?>
								</label>

								<div class='wp-block-newspack-blocks-donate__tiers tiers'>
									<?php foreach ( $suggested_amounts as $index => $suggested_amount ) : ?>
										<div class='wp-block-newspack-blocks-donate__tier'>
											<?php
												$amount           = 'year' === $frequency_slug || 'once' === $frequency_slug ? 12 * $suggested_amount : $suggested_amount;
												$formatted_amount = $settings['currencySymbol'] . number_format( $amount, floatval( $amount ) - intval( $amount ) ? 2 : 0 );
											?>
											<input
												type='radio'
												name='donation_value_<?php echo esc_attr( $frequency_slug ); ?>'
												value='<?php echo esc_attr( $amount ); ?>'
												id='newspack-tier-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-<?php echo (int) $index; ?>'
												<?php checked( 1, $index ); ?>
											/>
											<label
												class='tier-select-label tier-label'
												for='newspack-tier-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-<?php echo (int) $index; ?>'
											>
												<?php echo esc_html( $formatted_amount ); ?>
											</label>
										</div>
									<?php endforeach; ?>

									<div class='wp-block-newspack-blocks-donate__tier'>
										<?php $amount = 'year' === $frequency_slug || 'once' === $frequency_slug ? 12 * $suggested_amounts[1] : $suggested_amounts[1]; ?>
										<input
											type='radio'
											class='other-input'
											name='donation_value_<?php echo esc_attr( $frequency_slug ); ?>'
											value='other'
											id='newspack-tier-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-other'
										/>
										<label
											class='tier-select-label tier-label'
											for='newspack-tier-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-other'
										>
											<?php echo esc_html__( 'Other', 'newspack-blocks' ); ?>
										</label>
										<label
											class='other-donate-label odl'
											for='newspack-tier-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-other-input'
										>
											<?php echo esc_html__( 'Donation amount', 'newspack-blocks' ); ?>
										</label>
										<div class='wp-block-newspack-blocks-donate__money-input money-input'>
											<span class='currency'>
												<?php echo esc_html( $settings['currencySymbol'] ); ?>
											</span>
											<input
												type='number'
												name='donation_value_<?php echo esc_attr( $frequency_slug ); ?>_other'
												value='<?php echo esc_attr( $amount ); ?>'
												id='newspack-tier-<?php echo esc_attr( $frequency_slug . '-' . $uid ); ?>-other-input'
											/>
										</div>
									</div>

								</div>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
				  <?php echo $form_footer; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</form>
		</div>

		<?php
		endif;

		return ob_get_clean();
	}

	private static function get_streamlined_version_css_path() {
		$style_path = NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . 'donateStreamlined' . ( is_rtl() ? '.rtl' : '' ) . '.css';
		return plugins_url( $style_path, NEWSPACK_BLOCKS__PLUGIN_FILE );
	}

	public static function get_streamlined_version_js_script_data() {
		return Newspack_Blocks::script_enqueue_helper( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . '/donateStreamlined.js' );
	}

  /**
   * Handle iframe content
   */
  public static function display_donate_block_frame() {
		if ( isset( $_SERVER['REQUEST_URI'] ) ) { // WPCS: Input var okay.
			$raw_uri = wp_unslash( $_SERVER['REQUEST_URI'] ); // WPCS: Input var okay.
			if (0===stripos($raw_uri, '/?_newspack-render-donate-block-attrs')) {
				$parsed = parse_url($raw_uri);
				parse_str($parsed['query'], $res);
				$attributes = (array) json_decode($res['_newspack-render-donate-block-attrs']);
				$block_html = Donate_Block_Renderer::render_block_content( $attributes );

				$base_style_path = plugins_url( Newspack_Blocks::get_view_style_asset_path('donate'), NEWSPACK_BLOCKS__PLUGIN_FILE );
				$streamlined_script_data = self::get_streamlined_version_js_script_data();

				ob_start();
				?>
					<html>
						<head>
							<meta charset="UTF-8">
							<meta name="viewport" content="width=device-width, initial-scale=1">
							<link rel="stylesheet" href="<?php echo get_stylesheet_uri(); ?>">
							<link rel="stylesheet" href="<?php echo $base_style_path; ?>">
							<link rel="stylesheet" href="<?php echo self::get_streamlined_version_css_path(); ?>">
							<style media="screen">
								body{margin: 0;}
							</style>
						</head>
						<body>
							<?php echo $block_html; ?>
							<script type="text/javascript" src="<?php echo '/wp-includes/js/dist/hooks.min.js'; ?>"></script>
							<script type="text/javascript" src="<?php echo '/wp-includes/js/dist/i18n.min.js'; ?>"></script>
							<script type="text/javascript" src="<?php echo $streamlined_script_data['script_path']; ?>"></script>
						</body>
					</html>
				<?php
				echo ob_get_clean();
				exit;
			}
		}
	}

	public static function is_rendering_streamlined_block_in_amp() {
		return Newspack_Blocks::is_amp() && Newspack_Blocks::is_rendering_streamlined_block();
	}
}
Donate_Block_Renderer::init();
