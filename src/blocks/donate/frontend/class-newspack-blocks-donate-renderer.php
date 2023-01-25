<?php
/**
 * Server-side rendering of the `newspack-blocks/donate` block.
 *
 * @package WordPress
 */

defined( 'ABSPATH' ) || exit;

require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/donate/frontend/class-newspack-blocks-donate-renderer-frequency-based.php';
require_once NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/donate/frontend/class-newspack-blocks-donate-renderer-tiers-based.php';

/**
 * Server-side rendering of the `newspack-blocks/donate` block.
 */
class Newspack_Blocks_Donate_Renderer {
	/**
	 * Whether the modal checkout is used by donate block.
	 *
	 * @var boolean
	 */
	private static $has_modal_checkout = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue_modal_checkout_scripts' ] );
		add_action( 'wp_footer', [ __CLASS__, 'render_modal_checkout_iframe' ] );
		add_action( 'template_include', [ __CLASS__, 'get_modal_checkout_template' ] );
		add_filter( 'wc_get_template', [ __CLASS__, 'wc_get_template' ], 10, 2 );
		add_filter( 'woocommerce_checkout_fields', [ __CLASS__, 'woocommerce_checkout_fields' ] );
	}

	/**
	 * Modify fields for modal checkout.
	 *
	 * @param array $fields Checkout fields.
	 *
	 * @return array
	 */
	public static function woocommerce_checkout_fields( $fields ) {
		if ( ! class_exists( 'Newspack\Donations' ) || ! method_exists( 'Newspack\Donations', 'is_donation_cart' ) ) {
			return $fields;
		}
		if ( ! \Newspack\Donations::is_donation_cart() ) {
			return $fields;
		}
		if ( is_user_logged_in() ) {
			$fields['billing'] = [];
		} elseif ( ! empty( $fields['billing'] ) ) {
			$fields_to_keep = [
				'billing_first_name',
				'billing_last_name',
				'billing_email',
				'billing_phone',
			];
			$shipping_keys  = array_keys( $fields['billing'] );
			foreach ( $shipping_keys as $key ) {
				if ( in_array( $key, $fields_to_keep, true ) ) {
					continue;
				}
				unset( $fields['billing'][ $key ] );
			}
		}
		return $fields;
	}

	/**
	 * Enqueue frontend scripts and styles.
	 */
	public static function enqueue_modal_checkout_scripts() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		Newspack_Blocks::enqueue_view_assets( 'donate' );
		$filename    = 'donateCheckoutModal';
		$script_data = Newspack_Blocks::script_enqueue_helper( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . '/' . $filename . '.js' );
		wp_enqueue_script(
			'donate-modal-checkout',
			$script_data['script_path'],
			[],
			NEWSPACK_BLOCKS__VERSION,
			true
		);
		$style_path = NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . $filename . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			'donate-modal-checkout',
			plugins_url( $style_path, NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			NEWSPACK_BLOCKS__VERSION
		);
	}

	/**
	 * Enqueue frontend scripts and styles.
	 *
	 * @param string $handle_slug The slug of the script to enqueue.
	 */
	private static function enqueue_scripts( $handle_slug ) {
		$dependencies = [ 'wp-i18n' ];

		if ( 'streamlined' === $handle_slug ) {
			if ( method_exists( '\Newspack\Recaptcha', 'can_use_captcha' ) && \Newspack\Recaptcha::can_use_captcha() ) {
				$dependencies[] = \Newspack\Recaptcha::SCRIPT_HANDLE;
			}
		}

		switch ( $handle_slug ) {
			case 'streamlined':
				$filename = 'donateStreamlined';
				break;
			case 'frequency-based':
				$filename = 'frequencyBased';
				break;
			case 'tiers-based':
				$filename = 'tiersBased';
				break;
			default:
				$filename = false;
				break;
		}

		if ( false === $filename ) {
			return;
		}

		$script_data = Newspack_Blocks::script_enqueue_helper( NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . '/' . $filename . '.js' );
		wp_enqueue_script(
			Newspack_Blocks::SCRIPT_HANDLES[ $handle_slug ],
			$script_data['script_path'],
			$dependencies,
			NEWSPACK_BLOCKS__VERSION,
			true
		);

		$style_path = NEWSPACK_BLOCKS__BLOCKS_DIRECTORY . $filename . ( is_rtl() ? '.rtl' : '' ) . '.css';
		wp_enqueue_style(
			Newspack_Blocks::SCRIPT_HANDLES[ $handle_slug ],
			plugins_url( $style_path, NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			NEWSPACK_BLOCKS__VERSION
		);
	}

	/**
	 * Renders the `newspack-blocks/donate` block on server.
	 *
	 * @param array $attributes The block attributes.
	 *
	 * @return string
	 */
	public static function render( $attributes ) {
		if ( ! class_exists( 'Newspack\Donations' ) ) {
			return '';
		}

		$configuration = Newspack_Blocks_Donate_Renderer_Frequency_Based::get_configuration( $attributes );
		if ( \is_wp_error( $configuration ) ) {
			return '';
		}

		if ( $configuration['is_rendering_stripe_payment_form'] ) {
			self::enqueue_scripts( 'streamlined' );
		}

		Newspack_Blocks::enqueue_view_assets( 'donate' );

		if ( true === $attributes['useModalCheckout'] ) {
			self::$has_modal_checkout = true;
		}

		if ( $configuration['is_tier_based_layout'] ) {
			self::enqueue_scripts( 'tiers-based' );
			return Newspack_Blocks_Donate_Renderer_Tiers_Based::render( $attributes );
		} else {
			self::enqueue_scripts( 'frequency-based' );
			return Newspack_Blocks_Donate_Renderer_Frequency_Based::render( $attributes );
		}
	}

	/**
	 * Render the modal checkout iframe.
	 */
	public static function render_modal_checkout_iframe() {
		if ( ! self::$has_modal_checkout ) {
			return;
		}
		?>
		<div class="newspack-blocks-donate-checkout-modal" style="display: none;">
			<div class="newspack-blocks-donate-checkout-modal__content">
				<a href="#" class="newspack-blocks-donate-checkout-modal__close">
					<span class="screen-reader-text"><?php esc_html_e( 'Close', 'newspack-blocks' ); ?></span>
					<span class="dashicons dashicons-no-alt"></span>
				</a>
				<div class="newspack-blocks-donate-checkout-modal__spinner">
					<span class="spinner is-active"></span>
				</div>
				<iframe src="about:blank" name="newspack_modal_checkout"></iframe>
			</div>
		</div>
		<?php
	}

	/**
	 * Use stripped down template for modal checkout.
	 *
	 * @param string $template The template to render.
	 */
	public static function get_modal_checkout_template( $template ) {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return $template;
		}
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return $template;
		}
		return NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/donate/templates/modal-checkout.php';
	}

	/**
	 * Use modal checkout template when rendering the checkout form.
	 *
	 * @param string $located       Template file.
	 * @param string $template_name Template name.
	 *
	 * @return string Template file.
	 */
	public static function wc_get_template( $located, $template_name ) {
		if ( 'checkout/form-checkout.php' === $template_name && isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$located = NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/blocks/donate/templates/modal-checkout-form.php';
		}
		return $located;
	}
}
new Newspack_Blocks_Donate_Renderer();
