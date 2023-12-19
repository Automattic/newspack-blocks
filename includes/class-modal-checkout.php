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
	 * Whether the modal checkout has been enqueued.
	 *
	 * @var boolean
	 */
	private static $has_modal = false;

	/**
	 * Products that are being rendered a checkout modal for.
	 *
	 * @var true[] Product IDs as keys.
	 */
	private static $products = [];

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_action( 'wp_loaded', [ __CLASS__, 'process_checkout_request' ], 5 );
		add_action( 'wp_footer', [ __CLASS__, 'render_modal_markup' ], 100 );
		add_action( 'wp_footer', [ __CLASS__, 'render_variation_selection' ], 100 );
		add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue_scripts' ] );
		add_filter( 'show_admin_bar', [ __CLASS__, 'show_admin_bar' ] );
		add_action( 'template_include', [ __CLASS__, 'get_checkout_template' ] );
		add_filter( 'woocommerce_get_return_url', [ __CLASS__, 'woocommerce_get_return_url' ], 10, 2 );
		add_filter( 'woocommerce_get_checkout_order_received_url', [ __CLASS__, 'woocommerce_get_return_url' ], 10, 2 );
		add_filter( 'wc_get_template', [ __CLASS__, 'wc_get_template' ], 10, 2 );
		add_filter( 'woocommerce_checkout_fields', [ __CLASS__, 'woocommerce_checkout_fields' ] );
		add_filter( 'woocommerce_payment_successful_result', [ __CLASS__, 'woocommerce_payment_successful_result' ] );
		add_action( 'woocommerce_checkout_create_order_line_item', [ __CLASS__, 'woocommerce_checkout_create_order_line_item' ], 10, 4 );
		add_filter( 'newspack_donations_cart_item_data', [ __CLASS__, 'amend_cart_item_data' ] );
		add_filter( 'newspack_recaptcha_verify_captcha', [ __CLASS__, 'recaptcha_verify_captcha' ], 10, 2 );
		add_filter( 'woocommerce_enqueue_styles', [ __CLASS__, 'dequeue_woocommerce_styles' ] );
		add_filter( 'wcs_place_subscription_order_text', [ __CLASS__, 'order_button_text' ], 5 );
		add_filter( 'woocommerce_order_button_text', [ __CLASS__, 'order_button_text' ], 5 );
		add_filter( 'option_woocommerce_subscriptions_order_button_text', [ __CLASS__, 'order_button_text' ], 5 );
		add_action( 'woocommerce_before_checkout_form', [ __CLASS__, 'render_before_checkout_form' ] );
		add_action( 'woocommerce_checkout_before_customer_details', [ __CLASS__, 'render_before_customer_details' ] );
		add_action( 'woocommerce_checkout_before_terms_and_conditions', [ __CLASS__, 'render_before_terms_and_conditions' ] );
		add_filter( 'woocommerce_enable_order_notes_field', [ __CLASS__, 'enable_order_notes_field' ] );

		// Remove some stuff from the modal checkout page. It's displayed in an iframe, so it should not be treated as a separate page.
		add_action( 'wp_enqueue_scripts', [ __CLASS__, 'dequeue_scripts' ], 11 );
		add_filter( 'newspack_reader_activation_should_render_auth', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'newspack_enqueue_reader_activation_block', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'newspack_enqueue_memberships_block_patterns', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'newspack_ads_should_show_ads', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'newspack_theme_enqueue_js', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'newspack_theme_enqueue_print_styles', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'cmplz_site_needs_cookiewarning', [ __CLASS__, 'is_not_modal_checkout_filter' ] );
		add_filter( 'googlesitekit_analytics_tag_blocked', [ __CLASS__, 'is_modal_checkout' ] );
		add_filter( 'googlesitekit_analytics-4_tag_blocked', [ __CLASS__, 'is_modal_checkout' ] );
		add_filter( 'googlesitekit_adsense_tag_blocked', [ __CLASS__, 'is_modal_checkout' ] );
		add_filter( 'googlesitekit_tagmanager_tag_blocked', [ __CLASS__, 'is_modal_checkout' ] );
		add_filter( 'jetpack_active_modules', [ __CLASS__, 'jetpack_active_modules' ] );
	}

	/**
	 * Add information about modal checkout to cart item data.
	 *
	 * @param array $cart_item_data Cart item data.
	 */
	public static function amend_cart_item_data( $cart_item_data ) {
		if ( self::is_modal_checkout() ) {
			$cart_item_data['newspack_modal_checkout_url'] = \home_url( \add_query_arg( null, null ) );
		}
		return $cart_item_data;
	}

	/**
	 * Add information about modal checkout to order item meta.
	 *
	 * @param \WC_Order_Item_Product $item The cart item.
	 * @param string                 $cart_item_key The cart item key.
	 * @param array                  $values The cart item values.
	 * @param \WC_Order              $order The order.
	 * @return void
	 */
	public static function woocommerce_checkout_create_order_line_item( $item, $cart_item_key, $values, $order ) {
		if ( ! empty( $values['newspack_modal_checkout_url'] ) ) {
			$order->add_meta_data( '_newspack_modal_checkout_url', $values['newspack_modal_checkout_url'] );
		}
	}

	/**
	 * Change the post-transaction return URL.
	 * This is specifically for non-redirect-based flows, such as Apple Pay.
	 *
	 * @param array $result The return payload for a successfull transaction.
	 */
	public static function woocommerce_payment_successful_result( $result ) {
		$order_id           = $result['order_id'];
		$order              = \wc_get_order( $order_id );
		$modal_checkout_url = $order->get_meta( '_newspack_modal_checkout_url' );
		if ( empty( $modal_checkout_url ) ) {
			return $result;
		}

		$originating_from_modal = ! empty( $order->get_meta( '_newspack_modal_checkout_url' ) );
		if ( $originating_from_modal ) {
			$modal_checkout_url_query = \wp_parse_url( $modal_checkout_url, PHP_URL_QUERY );
			\wp_parse_str( $modal_checkout_url_query, $modal_checkout_url_query_params );
			$passed_params_names = [ 'modal_checkout', 'after_success_behavior', 'after_success_url', 'after_success_button_label' ];
			// Pick passed params from the query params.
			$passed_params = array_intersect_key( $modal_checkout_url_query_params, array_flip( $passed_params_names ) );

			$result['redirect'] = \add_query_arg(
				array_merge(
					$passed_params,
					[
						'order_id' => $order_id,
					]
				),
				$result['redirect']
			);
		}
		return $result;
	}

	/**
	 * Dequeue WC styles if on modal checkout.
	 *
	 * @param array $enqueue_styles Array of styles to enqueue.
	 */
	public static function dequeue_woocommerce_styles( $enqueue_styles ) {
		if ( ! self::is_modal_checkout() ) {
			return $enqueue_styles;
		}
		unset( $enqueue_styles['woocommerce-general'] );
		unset( $enqueue_styles['woocommerce-smallscreen'] );
		return $enqueue_styles;
	}

	/**
	 * Process checkout request for modal.
	 */
	public static function process_checkout_request() {
		if ( is_admin() ) {
			return;
		}

		$is_newspack_checkout       = filter_input( INPUT_GET, 'newspack_checkout', FILTER_SANITIZE_NUMBER_INT );
		$product_id                 = filter_input( INPUT_GET, 'product_id', FILTER_SANITIZE_NUMBER_INT );
		$variation_id               = filter_input( INPUT_GET, 'variation_id', FILTER_SANITIZE_NUMBER_INT );
		$after_success_behavior     = filter_input( INPUT_GET, 'after_success_behavior', FILTER_SANITIZE_SPECIAL_CHARS );
		$after_success_url          = filter_input( INPUT_GET, 'after_success_url', FILTER_SANITIZE_SPECIAL_CHARS );
		$after_success_button_label = filter_input( INPUT_GET, 'after_success_button_label', FILTER_SANITIZE_SPECIAL_CHARS );

		if ( ! $is_newspack_checkout || ! $product_id ) {
			return;
		}
		if ( $variation_id ) {
			$product_id = $variation_id;
		}

		\WC()->cart->empty_cart();

		$referer    = wp_get_referer();
		$params     = [];
		$parsed_url = wp_parse_url( $referer );

		// Get URL params appended to the referer URL.
		if ( ! empty( $parsed_url['query'] ) ) {
			wp_parse_str( $parsed_url['query'], $params );
		}

		$params = array_merge( $params, compact( 'after_success_behavior', 'after_success_url', 'after_success_button_label' ) );

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

		$cart_item_data = self::amend_cart_item_data( [ 'referer' => $referer ] );

		$newspack_popup_id = filter_input( INPUT_GET, 'newspack_popup_id', FILTER_SANITIZE_NUMBER_INT );
		if ( $newspack_popup_id ) {
			$cart_item_data['newspack_popup_id'] = $newspack_popup_id;
		}

		/** Apply NYP custom price */
		if ( class_exists( 'WC_Name_Your_Price_Helpers' ) ) {
			$is_product_nyp = \WC_Name_Your_Price_Helpers::is_nyp( $product_id );
			$price          = filter_input( INPUT_GET, 'price', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
			if ( $is_product_nyp ) {
				if ( empty( $price ) ) {
					$price = \WC_Name_Your_Price_Helpers::get_suggested_price( $product_id );
				}
				$min_price = \WC_Name_Your_Price_Helpers::get_minimum_price( $product_id );
				$max_price = \WC_Name_Your_Price_Helpers::get_maximum_price( $product_id );
				$price     = ! empty( $max_price ) ? min( $price, $max_price ) : $price;
				$price     = ! empty( $min_price ) ? max( $price, $min_price ) : $price;

				$cart_item_data['nyp'] = (float) \WC_Name_Your_Price_Helpers::standardize_number( $price );
			}
		}

		/**
		 * Filters the cart item data for the modal checkout.
		 *
		 * @param array $cart_item_data Cart item data.
		 */
		$cart_item_data = apply_filters( 'newspack_blocks_modal_checkout_cart_item_data', $cart_item_data );

		\WC()->cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );

		$query_args = [];

		if ( ! empty( $referer_tags ) ) {
			$query_args['referer_tags'] = implode( ',', $referer_tags );
		}
		if ( ! empty( $referer_categories ) ) {
			$query_args['referer_categories'] = implode( ',', $referer_categories );
		}
		$query_args['modal_checkout'] = 1;

		// Pass through UTM and after_success params so they can be forwarded to the WooCommerce checkout flow.
		foreach ( $params as $param => $value ) {
			if ( 'utm' === substr( $param, 0, 3 ) || 'after_success' === substr( $param, 0, 13 ) ) {
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
		/**
		* Filters the header title for the modal checkout.
		*
		* @param string $title The title.
		*/
		$title = apply_filters( 'newspack_blocks_modal_checkout_title', __( 'Complete your transaction', 'newspack-blocks' ) );
		?>
		<div class="newspack-blocks-checkout-modal newspack-blocks-modal">
			<div class="newspack-blocks-modal__container">
				<header class="newspack-blocks-modal__header">
					<h2><?php echo esc_html( $title ); ?></h2>
					<a href="#" class="newspack-blocks-modal__close">
						<span class="screen-reader-text"><?php esc_html_e( 'Close', 'newspack-blocks' ); ?></span>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
						</svg>
					</a>
				</header>
				<section class="newspack-blocks-modal__content">
					<div class="newspack-blocks-modal__spinner">
						<span></span>
					</div>
				</section>
			</div>
		</div>
		<?php
	}

	/**
	 * Render variation selection modal for variable products.
	 */
	public static function render_variation_selection() {
		/**
		* Filters the header title for the modal checkout.
		*
		* @param string $title The title.
		*/
		$title    = apply_filters( 'newspack_blocks_modal_checkout_title', __( 'Complete your transaction', 'newspack-blocks' ) );
		$products = array_keys( self::$products );
		foreach ( $products as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( ! $product->is_type( 'variable' ) ) {
				continue;
			}
			?>
			<div class="newspack-blocks-variation-modal newspack-blocks-modal" data-product-id="<?php echo esc_attr( $product_id ); ?>">
				<div class="newspack-blocks-modal__container">
					<header class="newspack-blocks-modal__header">
						<h2><?php echo esc_html( $title ); ?></h2>
						<a href="#" class="newspack-blocks-modal__close">
							<span class="screen-reader-text"><?php esc_html_e( 'Close', 'newspack-blocks' ); ?></span>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
							</svg>
						</a>
					</header>
					<section class="newspack-blocks-modal__content">
						<div class="newspack-blocks-variation-modal__selection" data-product-id="<?php echo esc_attr( $product_id ); ?>">
							<h3><?php echo esc_html( $product->get_name() ); ?></h3>
							<p><?php esc_html_e( 'Select an option below:', 'newspack-blocks' ); ?></p>
							<?php
							$variations = $product->get_available_variations( 'objects' );
							foreach ( $variations as $variation ) {
								$name        = wc_get_formatted_variation( $variation, true );
								$price       = $variation->get_price_html();
								$description = $variation->get_description();
								?>
								<form>
									<input type="hidden" name="newspack_checkout" value="1" />
									<input type="hidden" name="product_id" value="<?php echo esc_attr( $variation->get_id() ); ?>" />
									<button>
										<span class="summary">
											<span class="price"><?php echo $price; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
											<span class="variation_name"><?php echo esc_html( $name ); ?></span>
										</span>
										<?php if ( ! empty( $description ) ) : ?>
											<span class="description"><?php echo esc_html( $description ); ?></span>
										<?php endif; ?>
									</button>
								</form>
								<?php
							}
							?>
						</div>
					</section>
				</div>
			</div>
			<?php
		}
	}

	/**
	 * Enqueue scripts for the checkout page rendered in a modal.
	 */
	public static function enqueue_scripts() {
		if ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) {
			return;
		}
		if ( ! self::is_modal_checkout() ) {
			return;
		}
		wp_enqueue_script(
			'newspack-blocks-modal-checkout',
			plugins_url( 'dist/modalCheckout.js', \NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[ 'jquery' ],
			\NEWSPACK_BLOCKS__VERSION,
			true
		);
		wp_localize_script(
			'newspack-blocks-modal-checkout',
			'newspackBlocksModalCheckout',
			[
				'labels' => [
					'billing_details'  => __( 'Billing details', 'newspack-blocks' ),
					'shipping_details' => __( 'Shipping details', 'newspack-blocks' ),
				],
			]
		);
		wp_enqueue_style(
			'newspack-blocks-modal-checkout',
			plugins_url( 'dist/modalCheckout.css', \NEWSPACK_BLOCKS__PLUGIN_FILE ),
			[],
			\NEWSPACK_BLOCKS__VERSION
		);
	}

	/**
	 * Dequeue scripts not needed in the modal checkout.
	 */
	public static function dequeue_scripts() {
		if ( ! self::is_modal_checkout() ) {
			return;
		}
		wp_dequeue_style( 'cmplz-general' );
		wp_deregister_script( 'wp-mediaelement' );
		wp_deregister_style( 'wp-mediaelement' );
	}

	/**
	 * Enqueue script for triggering modal checkout.
	 *
	 * @param int $product_id Product ID (optional).
	 */
	public static function enqueue_modal( $product_id = null ) {
		self::$has_modal = true;
		if ( ! empty( $product_id ) ) {
			self::$products[ $product_id ] = true;
		}
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
		if ( ! self::is_modal_checkout() ) {
			return $template;
		}
		ob_start();
		?>
		<!doctype html>
		<html <?php language_attributes(); ?>>
		<head>
			<meta charset="<?php bloginfo( 'charset' ); ?>" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="profile" href="https://gmpg.org/xfn/11" />
			<?php wp_head(); ?>
		</head>
		<body id="newspack_modal_checkout">
			<?php
			echo do_shortcode( '[woocommerce_checkout]' );
			wp_footer();
			?>
		</body>
		</html>
		<?php
		ob_end_flush();
	}

	/**
	 * Get after success button params.
	 */
	private static function get_after_success_params() {
		return array_filter(
			[
				'after_success_behavior'     => isset( $_REQUEST['after_success_behavior'] ) ? rawurlencode( sanitize_text_field( wp_unslash( $_REQUEST['after_success_behavior'] ) ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'after_success_url'          => isset( $_REQUEST['after_success_url'] ) ? rawurlencode( sanitize_text_field( wp_unslash( $_REQUEST['after_success_url'] ) ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'after_success_button_label' => isset( $_REQUEST['after_success_button_label'] ) ? rawurlencode( sanitize_text_field( wp_unslash( $_REQUEST['after_success_button_label'] ) ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			]
		);
	}

	/**
	 * Render hidden inputs to pass some params along.
	 */
	private static function render_hidden_inputs() {
		foreach ( self::get_after_success_params() as $key => $value ) {
			?>
				<input type="hidden" name="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $value ); ?>" />
			<?php
		}
	}

	/**
	 * Return URL for modal checkout "thank you" page.
	 *
	 * @param string   $url The URL to redirect to.
	 * @param WC_Order $order The order related to the transaction.
	 *
	 * @return string
	 */
	public static function woocommerce_get_return_url( $url, $order ) {
		if ( ! self::is_modal_checkout() ) {
			return $url;
		}

		$args = array_merge(
			[
				'modal_checkout' => '1',
				'email'          => isset( $_REQUEST['billing_email'] ) ? rawurlencode( \sanitize_email( \wp_unslash( $_REQUEST['billing_email'] ) ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			],
			self::get_after_success_params()
		);

		// Pass order ID for modal checkout templates.
		if ( $order && is_a( $order, 'WC_Order' ) ) {
			$args['order_id'] = $order->get_id();
			$args['key']      = $order->get_order_key();
		}

		return add_query_arg(
			$args,
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
		if ( ! self::is_modal_checkout() ) {
			return $located;
		}

		$custom_templates = [
			'checkout/form-checkout.php' => 'src/modal-checkout/templates/form-checkout.php',
			'checkout/thankyou.php'      => 'src/modal-checkout/templates/thankyou.php',
			'checkout/form-coupon.php'   => 'src/modal-checkout/templates/form-coupon.php',
			// Replace the login form with the order summary if using the modal checkout. This is
			// for the case where the reader used an existing email address.
			'global/form-login.php'      => 'src/modal-checkout/templates/thankyou.php',
		];

		foreach ( $custom_templates as $original_template => $custom_template ) {
			if ( $template_name === $original_template ) {
				$located = NEWSPACK_BLOCKS__PLUGIN_DIR . $custom_template;
			}
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
		if ( ! self::is_modal_checkout() ) {
			return $show;
		}
		return false;
	}

	/**
	 * Modify fields for modal checkout.
	 *
	 * @param array $fields Checkout fields.
	 *
	 * @return array
	 */
	public static function woocommerce_checkout_fields( $fields ) {
		if ( ! self::is_modal_checkout() ) {
			return $fields;
		}
		$cart = \WC()->cart;
		// Don't modify fields if shipping is required.
		if ( $cart->needs_shipping_address() ) {
			return $fields;
		}
		/**
		 * Temporarily use the same fields as the donation checkout.
		 *
		 * This should soon be replaced with a logic that allows the customization
		 * at the Checkout Button Block level.
		 */
		$billing_fields = apply_filters( 'newspack_blocks_donate_billing_fields_keys', [] );
		if ( empty( $billing_fields ) ) {
			return $fields;
		}
		$billing_keys = array_keys( $fields['billing'] );
		foreach ( $billing_keys as $key ) {
			if ( in_array( $key, $billing_fields, true ) ) {
				continue;
			}
			unset( $fields['billing'][ $key ] );
		}
		return $fields;
	}

	/**
	 * Whether to show order details table.
	 *
	 * @return bool
	 */
	public static function should_show_order_details() {
		$cart = \WC()->cart;
		if ( $cart->is_empty() ) {
			return false;
		}
		if ( ! empty( $cart->get_applied_coupons() ) ) {
			return true;
		}
		if ( \wc_tax_enabled() && ! $cart->display_prices_including_tax() ) {
			return true;
		}
		if ( 1 < $cart->get_cart_contents_count() ) {
			return true;
		}
		if ( $cart->needs_shipping() ) {
			return true;
		}
		return false;
	}

	/**
	 * Render markup at the end of the "thank you" view.
	 *
	 * @param WC_Order $order The order related to the transaction.
	 *
	 * @return void
	 */
	public static function render_checkout_after_success_markup( $order ) {
		if ( self::is_newsletter_signup_available() ) {
			self::render_newsletter_signup_form( $order );
		} else {
			self::render_after_success_button();
		}
	}

	/**
	 * Render markup at the end of the "thank you" view.
	 *
	 * @return void
	 */
	private static function render_after_success_button() {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended
		if ( empty( $_REQUEST['modal_checkout'] ) ) {
			return;
		}

		$button_label = ! empty( $_REQUEST['after_success_button_label'] ) ? urldecode( wp_unslash( $_REQUEST['after_success_button_label'] ) ) : __( 'Continue browsing', 'newspack-blocks' ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$url          = ! empty( $_REQUEST['after_success_url'] ) ? urldecode( wp_unslash( $_REQUEST['after_success_url'] ) ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		?>
			<a
				<?php if ( empty( $url ) ) : ?>
					onclick="parent.newspackCloseModalCheckout(this);"
				<?php else : ?>
					href="<?php echo esc_url( $url ); ?>"
					target="_top"
				<?php endif; ?>
				class="button newspack-modal-newsletters__button"
			>
				<?php echo esc_html( $button_label ); ?>
			</a>
		<?php
		// phpcs:enable
	}

	/**
	 * Renders newsletter signup form.
	 *
	 * @param WC_Order $order The order related to the transaction.
	 */
	private static function render_newsletter_signup_form( $order ) {
		$email_address = $order->get_billing_email();
		if ( ! $email_address ) {
			return;
		}
		if ( ! method_exists( '\Newspack\Reader_Activation', 'get_registration_newsletter_lists' ) ) {
			return;
		}
		$newsletters_lists = array_filter(
			\Newspack\Reader_Activation::get_registration_newsletter_lists(),
			function( $item ) {
				return $item['active'];
			}
		);
		if ( empty( $newsletters_lists ) ) {
			return;
		}
		?>
			<div class="newspack-modal-newsletters">
				<h4><?php esc_html_e( 'Sign up for newsletters', 'newspack-blocks' ); ?></h4>
				<div class="newspack-modal-newsletters__info">
					<?php
					echo esc_html(
						sprintf(
							// Translators: %s is the site name.
							__( 'Get the best of %s directly in your email inbox.', 'newspack-blocks' ),
							get_bloginfo( 'name' )
						)
					);
					?>
					<br>
					<span>
					<?php
						echo esc_html(
							sprintf(
								// Translators: %s is the user's email address.
								__( 'Sending to: %s', 'newspack-blocks' ),
								$email_address
							)
						);
					?>
					</span>
				</div>
				<form>
					<input type="hidden" name="modal_checkout" value="1" />
					<input type="hidden" name="newsletter_signup_email" value="<?php echo esc_html( $email_address ); ?>" />
					<?php
					self::render_hidden_inputs();
					foreach ( $newsletters_lists as $list ) {
						$checkbox_id = sprintf( 'newspack-blocks-list-%s', $list['id'] );
						?>
							<div class="newspack-modal-newsletters__list-item">
							<input
								type="checkbox"
								name="lists[]"
								value="<?php echo \esc_attr( $list['id'] ); ?>"
								id="<?php echo \esc_attr( $checkbox_id ); ?>"
								<?php
								if ( isset( $list['checked'] ) && $list['checked'] ) {
									echo 'checked';
								}
								?>
							>
							<label for="<?php echo \esc_attr( $checkbox_id ); ?>">
								<b><?php echo \esc_html( $list['title'] ); ?></b>
								<?php if ( ! empty( $list['description'] ) ) : ?>
									<span><?php echo \esc_html( $list['description'] ); ?></span>
								<?php endif; ?>
							</label>
							</div>
						<?php
					}
					?>
					<input type="submit" value="<?php esc_html_e( 'Continue', 'newspack-blocks' ); ?>">
				</form>
			</div>
		<?php
	}

	/**
	 * Should post-chcekout newsletter signup be available?
	 */
	private static function is_newsletter_signup_available() {
		return defined( 'NEWSPACK_ENABLE_POST_CHECKOUT_NEWSLETTER_SIGNUP' ) && NEWSPACK_ENABLE_POST_CHECKOUT_NEWSLETTER_SIGNUP;
	}

	/**
	 * Should newsletter confirmation be rendered?
	 */
	public static function confirm_newsletter_signup() {
		if ( ! self::is_newsletter_signup_available() ) {
			return false;
		}
		$signup_data = self::get_newsletter_signup_data();
		if ( false !== $signup_data ) {
			if ( empty( $signup_data['lists'] ) ) {
				return new \WP_Error( 'newspack_no_lists_selected', __( 'No lists selected.', 'newspack-blocks' ) );
			} else {
				$result = \Newspack_Newsletters_Subscription::add_contact(
					[
						'email'    => $signup_data['email'],
						'metadata' => [
							'current_page_url' => home_url( add_query_arg( array(), \wp_get_referer() ) ),
							'newsletters_subscription_method' => 'post-checkout',
						],
					],
					$signup_data['lists']
				);
				if ( \is_wp_error( $result ) ) {
					return $result;
				}
			}
			return true;
		}
		return false;
	}

	/**
	 * Should newsletter confirmation be rendered?
	 */
	public static function get_newsletter_signup_data() {
		$newsletter_signup_email = isset( $_GET['newsletter_signup_email'] ) ? \sanitize_text_field( \wp_unslash( $_GET['newsletter_signup_email'] ) ) : false; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( $newsletter_signup_email && isset( $_SERVER['REQUEST_URI'] ) ) {
			parse_str( \wp_parse_url( \wp_unslash( $_SERVER['REQUEST_URI'] ) )['query'], $query ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			$signup_data = [
				'email' => $newsletter_signup_email,
				'lists' => [],
			];
			if ( isset( $query['lists'] ) && count( $query['lists'] ) ) {
				$signup_data['lists'] = $query['lists'];
			}
			return $signup_data;
		}
		return false;
	}

	/**
	 * Renders newsletter signup confirmation.
	 *
	 * @param bool $no_lists_selected Whether no lists were selected.
	 */
	public static function render_newsletter_confirmation( $no_lists_selected = false ) {
		?>
			<?php if ( ! $no_lists_selected ) : ?>
				<h4><?php esc_html_e( 'Signup successful!', 'newspack-blocks' ); ?></h4>
			<?php endif; ?>
			<p>
				<?php
				echo esc_html(
					sprintf(
						// Translators: %s is the site name.
						__( 'Thanks for supporting %s.', 'newspack-blocks' ),
						get_option( 'blogname' )
					)
				);
				?>
			</p>
		<?php
		self::render_after_success_button();
	}

	/**
	 * Prevent reCaptcha from being verified for AJAX checkout (e.g. Apple Pay).
	 *
	 * @param bool   $should_verify Whether to verify the captcha.
	 * @param string $url The URL from which the checkout originated.
	 */
	public static function recaptcha_verify_captcha( $should_verify, $url ) {
		parse_str( \wp_parse_url( $url, PHP_URL_QUERY ), $query );
		if (
			// Only in the context of a checkout request.
			defined( 'WOOCOMMERCE_CHECKOUT' )
			&& isset( $query['wc-ajax'] )
			&& 'wc_stripe_create_order' === $query['wc-ajax']
		) {
			return false;
		}
		return $should_verify;
	}

	/**
	 * Is this request using the modal checkout?
	 */
	public static function is_modal_checkout() {
		$is_modal_checkout = isset( $_REQUEST['modal_checkout'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! $is_modal_checkout && isset( $_REQUEST['post_data'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$is_modal_checkout = strpos( $_REQUEST['post_data'], 'modal_checkout=1' ) !== false; // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		}
		return $is_modal_checkout;
	}

	/**
	 * Set the "Place order" button text.
	 *
	 * @param string $text The button text.
	 */
	public static function order_button_text( $text ) {
		if ( ! self::is_modal_checkout() ) {
			return $text;
		}
		$cart = \WC()->cart;
		if ( ! $cart || $cart->is_empty() ) {
			return $text;
		}
		return sprintf(
			// Translators: %s is the price.
			__( 'Complete transaction: %s', 'newspack-blocks' ),
			esc_html( wp_strip_all_tags( \WC()->cart->get_total() ) )
		);
	}

	/**
	 * Render before the checkout form.
	 *
	 * This will render the order summary card.
	 */
	public static function render_before_checkout_form() {
		if ( ! self::is_modal_checkout() ) {
			return;
		}
		$cart = \WC()->cart;
		if ( 1 !== $cart->get_cart_contents_count() ) {
			return;
		}
		?>
		<div class="order-details-summary">
			<?php
			// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WooCommerce hooks.
			foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) :
				$_product = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
				if ( $_product && $_product->exists() && $cart_item['quantity'] > 0 && apply_filters( 'woocommerce_checkout_cart_item_visible', true, $cart_item, $cart_item_key ) ) :
					?>
					<h2>
						<?php
						echo apply_filters( 'woocommerce_cart_item_name', $_product->get_name(), $cart_item, $cart_item_key ) . ': '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo wc_get_formatted_cart_item_data( $cart_item ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						?>
						<?php echo apply_filters( 'woocommerce_cart_item_subtotal', $cart->get_product_subtotal( $_product, $cart_item['quantity'] ), $cart_item, $cart_item_key ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
					</h2>
					<?php
				endif;
			endforeach;
			// phpcs:enable
			?>
		</div>
		<?php
	}

	/**
	 * Render before customer details.
	 *
	 * This will render the hidden inputs necessary for the modal checkout.
	 */
	public static function render_before_customer_details() {
		if ( ! self::is_modal_checkout() ) {
			return;
		}
		?>
		<input type="hidden" name="modal_checkout" value="1" />
		<?php self::render_hidden_inputs(); ?>
		<?php
	}

	/**
	 * Render before checkout terms and conditions.
	 *
	 * Renders the order review table between the gateway selection and
	 * the submit button. It will be dynamically loaded as part the "#payment"
	 * fragment on checkout updates.
	 */
	public static function render_before_terms_and_conditions() {
		if ( ! self::is_modal_checkout() ) {
			return;
		}
		if ( ! self::should_show_order_details() ) {
			return;
		}
		// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WooCommerce hooks.
		?>
		<div class="order-review">
			<?php do_action( 'woocommerce_checkout_before_order_review_heading' ); ?>
			<h3 id="order_review_heading"><?php esc_html_e( 'Transaction details', 'newspack-blocks' ); ?></h3>
			<?php do_action( 'woocommerce_checkout_before_order_review' ); ?>
			<div id="order_review" class="woocommerce-checkout-review-order">
				<?php do_action( 'woocommerce_checkout_order_review' ); ?>
			</div>
			<?php do_action( 'woocommerce_checkout_after_order_review' ); ?>
		</div>
		<?php
		// phpcs:enable
	}

	/**
	 * Disable order notes in the modal checkout.
	 *
	 * @param bool $enable Whether to enable the order notes field.
	 *
	 * @return bool
	 */
	public static function enable_order_notes_field( $enable ) {
		if ( self::is_modal_checkout() ) {
			return false;
		}
		return $enable;
	}

	/**
	 * Filter the a value dependent on the page not being modal checkout.
	 *
	 * @param bool $value The value.
	 */
	public static function is_not_modal_checkout_filter( $value ) {
		if ( self::is_modal_checkout() ) {
			return false;
		}
		return $value;
	}

	/**
	 * Deactivate all Jetpack modules on the modal checkout.
	 *
	 * @param bool $modules JP modules.
	 */
	public static function jetpack_active_modules( $modules ) {
		if ( self::is_modal_checkout() ) {
			return [];
		}
		return $modules;
	}
}
Modal_Checkout::init();
