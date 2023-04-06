<?php
/**
 * Newspack Blocks Modal Checkout
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Modal Checkout Class.
 */
final class Modal_Checkout {
	/**
	 * Whether the modal checkout is used by donate any block.
	 *
	 * @var boolean
	 */
	private static $has_modal = false;

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_action( 'template_redirect', [ __CLASS__, 'process_checkout_request' ] );
		add_action( 'wp_footer', [ __CLASS__, 'render_modal_markup' ], 100 );
		add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue_scripts' ] );
		add_filter( 'show_admin_bar', [ __CLASS__, 'show_admin_bar' ] );
		add_action( 'template_include', [ __CLASS__, 'get_checkout_template' ] );
		add_filter( 'woocommerce_get_return_url', [ __CLASS__, 'woocommerce_get_return_url' ], 10, 2 );
		add_filter( 'wc_get_template', [ __CLASS__, 'wc_get_template' ], 10, 2 );
		add_filter( 'woocommerce_checkout_get_value', [ __CLASS__, 'woocommerce_checkout_get_value' ], 10, 2 );
	}

	/**
	 * Process checkout request for modal.
	 */
	public static function process_checkout_request() {
		$is_newspack_checkout = filter_input( INPUT_GET, 'newspack_checkout', FILTER_SANITIZE_NUMBER_INT );
		$product_id           = filter_input( INPUT_GET, 'product_id', FILTER_SANITIZE_NUMBER_INT );
		if ( ! $is_newspack_checkout || ! $product_id ) {
			return;
		}

		\WC()->cart->empty_cart();

		$referer    = wp_get_referer();
		$params     = [];
		$parsed_url = wp_parse_url( $referer );

		// Get URL params appended to the referer URL.
		if ( ! empty( $parsed_url['query'] ) ) {
			wp_parse_str( $parsed_url['query'], $params );
		}

		if ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			$referer_post_id = wpcom_vip_url_to_postid( $referer );
		} else {
			$referer_post_id = url_to_postid( $referer ); // phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
		}

		$referer_tags       = [];
		$referer_categories = [];
		$tags               = get_the_tags( $referer_post_id );
		if ( $tags && ! empty( $tags ) ) {
			$referer_tags = array_map(
				function ( $item ) {
					return $item->slug;
				},
				$tags
			);
		}

		$categories = get_the_category( $referer_post_id );
		if ( $categories && ! empty( $categories ) ) {
			$referer_categories = array_map(
				function ( $item ) {
					return $item->slug;
				},
				$categories
			);
		}

		$cart_item_data = [ 'referer' => $referer ];

		$newspack_popup_id = filter_input( INPUT_GET, 'newspack_popup_id', FILTER_SANITIZE_NUMBER_INT );
		if ( $newspack_popup_id ) {
			$cart_item_data['newspack_popup_id'] = $newspack_popup_id;
		}

		/** Apply NYP custom price */
		if ( class_exists( 'WC_Name_Your_Price_Helpers' ) ) {
			$is_product_nyp = \WC_Name_Your_Price_Helpers::is_nyp( $product_id );
			$price          = filter_input( INPUT_GET, 'price', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
			if ( $is_product_nyp && $price ) {
				$cart_item_data['nyp'] = (float) \WC_Name_Your_Price_Helpers::standardize_number( $price );
			}
		}

		\WC()->cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );

		$query_args = [];

		if ( ! empty( $referer_tags ) ) {
			$query_args['referer_tags'] = implode( ',', $referer_tags );
		}
		if ( ! empty( $referer_categories ) ) {
			$query_args['referer_categories'] = implode( ',', $referer_categories );
		}
		$query_args['modal_checkout'] = 1;

		// Pass through UTM params so they can be forwarded to the WooCommerce checkout flow.
		foreach ( $params as $param => $value ) {
			if ( 'utm' === substr( $param, 0, 3 ) ) {
				$param                = sanitize_text_field( $param );
				$query_args[ $param ] = sanitize_text_field( $value );
			}
		}

		$checkout_url = add_query_arg(
			$query_args,
			\wc_get_page_permalink( 'checkout' )
		);

		// Redirect to checkout.
		\wp_safe_redirect( apply_filters( 'newspack_blocks_checkout_url', $checkout_url ) );
		exit;
	}

	/**
	 * Render the markup necessary for the modal checkout.
	 */
	public static function render_modal_markup() {
		if ( ! self::$has_modal ) {
			return;
		}
		?>
		<div class="newspack-blocks-checkout-modal" style="display: none;">
			<div class="newspack-blocks-checkout-modal__content">
				<a href="#" class="newspack-blocks-checkout-modal__close">
					<span class="screen-reader-text"><?php esc_html_e( 'Close', 'newspack-blocks' ); ?></span>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
						<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
					</svg>
				</a>
				<div class="newspack-blocks-checkout-modal__spinner">
					<span></span>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 * Enqueue scripts for the checkout page rendered in a modal.
	 */
	public static function enqueue_scripts() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return;
		}
		wp_enqueue_script(
			'newspack-blocks-modal-checkout',
			plugins_url( 'dist/modalCheckout.js', \NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			\NEWSPACK_BLOCKS__VERSION,
			true
		);
		wp_enqueue_style(
			'newspack-blocks-modal-checkout',
			plugins_url( 'dist/modalCheckout.css', \NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			\NEWSPACK_BLOCKS__VERSION
		);
	}

	/**
	 * Enqueue script for triggering modal checkout.
	 */
	public static function enqueue_modal() {
		self::$has_modal = true;
		wp_enqueue_script(
			'newspack-blocks-modal',
			plugins_url( 'dist/modal.js', \NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			\NEWSPACK_BLOCKS__VERSION,
			true
		);
		wp_enqueue_style(
			'newspack-blocks-modal',
			plugins_url( 'dist/modal.css', \NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			\NEWSPACK_BLOCKS__VERSION
		);
	}

	/**
	 * Use stripped down template for modal checkout.
	 *
	 * @param string $template The template to render.
	 *
	 * @return string
	 */
	public static function get_checkout_template( $template ) {
		if ( ! function_exists( 'is_checkout' ) || ! function_exists( 'is_order_received_page' ) ) {
			return $template;
		}
		if ( ! is_checkout() && ! is_order_received_page() ) {
			return $template;
		}
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return $template;
		}
		ob_start();
		wp_head();
		while ( have_posts() ) {
			the_post();
			echo '<div id="newspack_modal_checkout">';
			the_content();
			echo '</div>';
		}
		wp_footer();
		ob_end_flush();
	}


	/**
	 * Return URL for modal checkout "thank you" page.
	 *
	 * @param string $url The URL to redirect to.
	 *
	 * @return string
	 */
	public static function woocommerce_get_return_url( $url ) {
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return $url;
		}
		return add_query_arg(
			[
				'modal_checkout' => '1',
				'email'          => isset( $_REQUEST['billing_email'] ) ? rawurlencode( sanitize_email( wp_unslash( $_REQUEST['billing_email'] ) ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			],
			$url
		);
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
			$located = NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/modal-checkout/templates/checkout-form.php';
		}
		return $located;
	}

	/**
	 * Disable admin bar for modal checkout.
	 *
	 * @param bool $show Whether to show the admin bar.
	 *
	 * @return bool
	 */
	public static function show_admin_bar( $show ) {
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return $show;
		}
		return false;
	}

	/**
	 * Check the nonce for the edit billing request.
	 *
	 * @return bool
	 */
	private static function validate_edit_billing_request() {
		if ( ! isset( $_REQUEST['newspack_blocks_edit_billing_nonce'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return false;
		}
		if ( ! wp_verify_nonce( sanitize_key( $_REQUEST['newspack_blocks_edit_billing_nonce'] ), 'newspack_blocks_edit_billing' ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return false;
		}
		return true;
	}

	/**
	 * Modify WC checkout field value.
	 *
	 * @param null   $value Value.
	 * @param string $input Input name.
	 *
	 * @return string|null Value or null if unaltered.
	 */
	public static function woocommerce_checkout_get_value( $value, $input ) {
		if ( ! isset( $_REQUEST['modal_checkout'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return null;
		}
		$valid_request = self::validate_edit_billing_request(); // This performs nonce verification.
		if ( ! $valid_request ) {
			return null;
		}
		if ( isset( $_REQUEST[ $input ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$value = sanitize_text_field( wp_unslash( $_REQUEST[ $input ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}
		return $value;
	}

	/**
	 * Get the prefilled values for billing fields.
	 *
	 * @return array
	 */
	public static function get_prefilled_fields() {
		$checkout        = \WC()->checkout();
		$fields          = $checkout->get_checkout_fields( 'billing' );
		$customer        = new \WC_Customer( get_current_user_id() );
		$customer_fields = $customer->get_billing();
		// If the user is logged in and there's no billing email, use the user's email.
		if ( is_user_logged_in() && empty( $customer_fields['email'] ) ) {
			$customer_fields['email'] = $customer->get_email();
		}
		$valid_request    = self::validate_edit_billing_request();
		$prefilled_fields = [];
		foreach ( $fields as $key => $field ) {
			$key = str_replace( 'billing_', '', $key );
			if ( $valid_request && isset( $_REQUEST[ 'billing_' . $key ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$value = sanitize_text_field( wp_unslash( $_REQUEST[ 'billing_' . $key ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			} elseif ( isset( $customer_fields[ $key ] ) ) {
				$value = $customer_fields[ $key ];
			}
			$prefilled_fields[ $key ] = $value;
		}
		return $prefilled_fields;
	}

	/**
	 * Whether the current checkout session has all required billing fields filled.
	 *
	 * @return bool
	 */
	public static function has_filled_required_fields() {
		$checkout        = \WC()->checkout();
		$fields          = $checkout->get_checkout_fields( 'billing' );
		$required        = array_filter(
			$fields,
			function( $field ) {
				return isset( $field['required'] ) && $field['required'];
			}
		);
		$required_keys   = array_keys( $required );
		$customer_fields = self::get_prefilled_fields();
		$is_request      = self::validate_edit_billing_request();
		foreach ( $required_keys as $key ) {
			$key = str_replace( 'billing_', '', $key );
			if ( empty( $customer_fields[ $key ] ) ) {
				if ( $is_request ) {
					/* translators: %s: field name */
					wc_add_notice( sprintf( __( '%s is a required field.', 'newspack-blocks' ), $fields[ 'billing_' . $key ]['label'] ), 'error' );
				}
				return false;
			}
		}
		return true;
	}
}
Modal_Checkout::init();
