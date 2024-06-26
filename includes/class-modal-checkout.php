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
	 * Labels for the modal checkout UI.
	 *
	 * @var mixed[]
	 */
	private static $modal_checkout_labels = [];

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_action( 'wp_loaded', [ __CLASS__, 'process_checkout_request' ], 5 );
		add_filter( 'wp_redirect', [ __CLASS__, 'pass_url_param_on_redirect' ] );
		add_filter( 'woocommerce_cart_product_cannot_be_purchased_message', [ __CLASS__, 'woocommerce_cart_product_cannot_be_purchased_message' ], 10, 2 );
		add_action( 'wp_footer', [ __CLASS__, 'render_modal_markup' ], 100 );
		add_action( 'wp_footer', [ __CLASS__, 'render_variation_selection' ], 100 );
		add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue_scripts' ] );
		add_filter( 'show_admin_bar', [ __CLASS__, 'show_admin_bar' ] );
		add_action( 'template_include', [ __CLASS__, 'get_checkout_template' ] );
		add_filter( 'woocommerce_get_return_url', [ __CLASS__, 'woocommerce_get_return_url' ], 10, 2 );
		add_filter( 'woocommerce_get_checkout_order_received_url', [ __CLASS__, 'woocommerce_get_return_url' ], 10, 2 );
		add_filter( 'wc_get_template', [ __CLASS__, 'wc_get_template' ], 10, 2 );
		add_filter( 'woocommerce_checkout_fields', [ __CLASS__, 'woocommerce_checkout_fields' ] );
		add_filter( 'woocommerce_update_order_review_fragments', [ __CLASS__, 'order_review_fragments' ] );
		add_filter( 'newspack_recaptcha_verify_captcha', [ __CLASS__, 'recaptcha_verify_captcha' ], 10, 2 );
		add_filter( 'woocommerce_enqueue_styles', [ __CLASS__, 'dequeue_woocommerce_styles' ] );
		add_filter( 'wcs_place_subscription_order_text', [ __CLASS__, 'order_button_text' ], 5 );
		add_filter( 'woocommerce_order_button_text', [ __CLASS__, 'order_button_text' ], 5 );
		add_filter( 'option_woocommerce_subscriptions_order_button_text', [ __CLASS__, 'order_button_text' ], 5 );
		add_action( 'woocommerce_before_checkout_form', [ __CLASS__, 'render_before_checkout_form' ] );
		add_action( 'woocommerce_before_checkout_form', [ __CLASS__, 'render_name_your_price_form' ], 11 );
		add_action( 'woocommerce_checkout_before_customer_details', [ __CLASS__, 'render_before_customer_details' ] );
		add_filter( 'woocommerce_enable_order_notes_field', [ __CLASS__, 'enable_order_notes_field' ] );
		add_action( 'woocommerce_checkout_process', [ __CLASS__, 'wcsg_apply_gift_subscription' ] );
		add_filter( 'woocommerce_order_received_verify_known_shoppers', '__return_false' );
		add_filter( 'woocommerce_order_button_html', [ __CLASS__, 'order_button_html' ], 10, 1 );
		add_action( 'option_woocommerce_default_customer_address', [ __CLASS__, 'ensure_base_default_customer_address' ] );
		add_action( 'default_option_woocommerce_default_customer_address', [ __CLASS__, 'ensure_base_default_customer_address' ] );
		add_action( 'wp_ajax_process_name_your_price_request', [ __CLASS__, 'process_name_your_price_request' ] );

		/** Custom handling for registered users. */
		add_filter( 'woocommerce_checkout_customer_id', [ __CLASS__, 'associate_existing_user' ] );
		add_filter( 'woocommerce_checkout_posted_data', [ __CLASS__, 'skip_account_creation' ], 11 );

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

		/**
		 * Ensure that options to limit the number of subscriptions per product are respected.
		 * Note: This is normally called only for regular checkout pages and REST API requests,
		 * so we need to add the filters for modal checkout.
		 *
		 * See: https://github.com/Automattic/woocommerce-subscriptions-core/blob/trunk/includes/class-wcs-limiter.php#L23
		*/
		if ( self::is_modal_checkout() && class_exists( 'WCS_Limiter' ) ) {
			add_filter( 'woocommerce_subscription_is_purchasable', [ 'WCS_Limiter', 'is_purchasable_switch' ], 12, 2 );
			add_filter( 'woocommerce_subscription_variation_is_purchasable', [ 'WCS_Limiter', 'is_purchasable_switch' ], 12, 2 );
			add_filter( 'woocommerce_subscription_is_purchasable', [ 'WCS_Limiter', 'is_purchasable_renewal' ], 12, 2 );
			add_filter( 'woocommerce_subscription_variation_is_purchasable', [ 'WCS_Limiter', 'is_purchasable_renewal' ], 12, 2 );
			add_filter( 'woocommerce_valid_order_statuses_for_order_again', [ 'WCS_Limiter', 'filter_order_again_statuses_for_limited_subscriptions' ] );
		}
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
		$after_success_url          = filter_input( INPUT_GET, 'after_success_url', FILTER_SANITIZE_URL );
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
		$price = filter_input( INPUT_GET, 'price', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
		if ( \Newspack_Blocks::can_use_name_your_price() ? \WC_Name_Your_Price_Helpers::is_nyp( $product_id ) : false ) {
			if ( empty( $price ) ) {
				$price = \WC_Name_Your_Price_Helpers::get_suggested_price( $product_id );
			}
			$min_price = \WC_Name_Your_Price_Helpers::get_minimum_price( $product_id );
			$max_price = \WC_Name_Your_Price_Helpers::get_maximum_price( $product_id );
			$price     = ! empty( $max_price ) ? min( $price, $max_price ) : $price;
			$price     = ! empty( $min_price ) ? max( $price, $min_price ) : $price;

			$cart_item_data['nyp'] = (float) \WC_Name_Your_Price_Helpers::standardize_number( $price );
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
	 * Process name your price request for modal.
	 */
	public static function process_name_your_price_request() {
		if ( ! defined( 'DOING_AJAX' ) ) {
			return;
		}

		if ( ! function_exists( 'WC' ) || ! \Newspack_Blocks::can_use_name_your_price() || ! method_exists( '\WC_Name_Your_Price_Helpers', 'is_nyp' ) ) {
			return;
		}

		check_ajax_referer( 'newspack_checkout_name_your_price' );

		$is_newspack_checkout_nyp = filter_input( INPUT_POST, 'newspack_checkout_name_your_price', FILTER_SANITIZE_NUMBER_INT );
		$product_id               = filter_input( INPUT_POST, 'product_id', FILTER_SANITIZE_NUMBER_INT );

		if ( ! $is_newspack_checkout_nyp || ! $product_id ) {
			return;
		}

		$price     = \WC_Name_Your_Price_Helpers::standardize_number( filter_input( INPUT_POST, 'price', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION ) );
		$max_price = \WC_Name_Your_Price_Helpers::get_maximum_price( $product_id );

		if ( ! empty( $max_price ) && $price > $max_price ) {
			wp_send_json_error(
				[
					'message' => sprintf(
						// Translators: %s is the maximum price.
						__( 'Adjusted price must be less than the maximum of %s.', 'newspack-blocks' ),
						\wc_price( $max_price )
					),
				]
			);

			wp_die();
		}

		$cart_item_data = self::amend_cart_item_data( [ 'referer' => wp_get_referer() ] );

		foreach ( \WC()->cart->get_cart() as $cart_item_key => $cart_item ) { // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UnusedVariable
			if ( $cart_item['product_id'] !== (int) $product_id && $cart_item['variation_id'] !== (int) $product_id ) {
				continue;
			}

			$cart_item_data['nyp'] = $price;
			$cart_item_data['base_price'] = isset( $cart_item['base_price'] ) ? $cart_item['base_price'] : $cart_item['nyp'];

			if ( $price < $cart_item_data['base_price'] ) {
				wp_send_json_error(
					[
						'message' => sprintf(
							// Translators: %s is the name-your-price custom price.
							__( 'Adjusted price must be greater than base price of %s.', 'newspack-blocks' ),
							\wc_price( $cart_item_data['base_price'] )
						),
					]
				);

				wp_die();
			}
		}

		\WC()->cart->empty_cart();
		\WC()->cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );

		wp_send_json_success(
			[
				'message' => self::get_modal_checkout_labels( 'checkout_nyp_thankyou' ),
				'price'   => \wc_price( $price ),
			]
		);

		wp_die();
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
		$title        = self::get_modal_checkout_labels( 'checkout_modal_title' );
		$class_prefix = self::get_class_prefix();
		?>
		<div id="newspack_modal_checkout" class="<?php echo esc_attr( "$class_prefix {$class_prefix}__modal-container" ); ?>">
			<div class="<?php echo esc_attr( "{$class_prefix}__modal-container__overlay" ); ?>"></div>
			<div class="<?php echo esc_attr( "{$class_prefix}__modal" ); ?>">
				<header class="<?php echo esc_attr( "{$class_prefix}__modal__header" ); ?>">
					<h2><?php echo esc_html( $title ); ?></h2>
					<button class="<?php echo esc_attr( "{$class_prefix}__button {$class_prefix}__button--icon {$class_prefix}__button--ghost {$class_prefix}__modal__close" ); ?>">
						<span class="screen-reader-text"><?php esc_html_e( 'Close', 'newspack-blocks' ); ?></span>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
							<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
						</svg>
					</button>
				</header>
				<section class="<?php echo esc_attr( "{$class_prefix}__modal__content" ); ?>">
					<div class="<?php echo esc_attr( "{$class_prefix}__spinner" ); ?>">
						<span></span>
					</div>
				</section>
			</div>
		</div>
		<?php
	}

	/**
	 * Update product price string for subscriptions to use "per" instead of "/".
	 *
	 * @param string $price_string The price string.
	 */
	public static function update_subscriptions_product_price_string( $price_string ) {
		$price_string = str_replace( ' / ', ' ' . __( 'per', 'newspack-blocks' ) . ' ', $price_string );
		return $price_string;
	}

	/**
	 * Update price to remove empty decimals (.00) if over three digits.
	 *
	 * @param string $price_string The price string.
	 */
	public static function maybe_remove_decimal_spaces( $price_string ) {
		$decimal_separator = wc_get_price_decimal_separator();
		$pattern           = '/\b\d{3,}' . preg_quote( $decimal_separator, '/' ) . '00\b/';
		preg_match( $pattern, $price_string, $matches );
		if ( ! empty( $matches ) ) {
			$replace_pattern = '/' . preg_quote( $decimal_separator, '/' ) . '00$/';
			$price_string    = preg_replace( $pattern, preg_replace( $replace_pattern, '', $matches[0] ), $price_string );
		}
		return $price_string;
	}

	/**
	 * Render variation selection modal for variable products.
	 */
	public static function render_variation_selection() {
		if ( ! function_exists( 'WC' ) ) {
			return;
		}

		add_filter( 'woocommerce_subscriptions_product_price_string', [ __CLASS__, 'update_subscriptions_product_price_string' ], 10, 1 );
		add_filter( 'formatted_woocommerce_price', [ __CLASS__, 'maybe_remove_decimal_spaces' ], 10, 1 );
		/**
		* Filters the header title for the modal checkout.
		*
		* @param string $title The title.
		*/
		$title        = self::get_modal_checkout_labels( 'variation_modal_title' );
		$products     = array_keys( self::$products );
		$class_prefix = self::get_class_prefix();

		$products = array_keys( self::$products );
		foreach ( $products as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( ! $product->is_type( 'variable' ) ) {
				continue;
			}
			$product_name = $product->get_name();
			?>
			<div
				class="<?php echo esc_attr( "$class_prefix {$class_prefix}__modal-container newspack-blocks__modal-variation" ); ?>"
				data-product-id="<?php echo esc_attr( $product_id ); ?>"
			>
				<div class="<?php echo esc_attr( "{$class_prefix}__modal-container__overlay" ); ?>"></div>
				<div class="<?php echo esc_attr( "{$class_prefix}__modal" ); ?>">
					<header class="<?php echo esc_attr( "{$class_prefix}__modal__header" ); ?>">
						<h2><?php echo esc_html( $title ); ?></h2>
						<button class="<?php echo esc_attr( "{$class_prefix}__button {$class_prefix}__button--icon {$class_prefix}__button--ghost {$class_prefix}__modal__close" ); ?>">
							<span class="screen-reader-text"><?php esc_html_e( 'Close', 'newspack-blocks' ); ?></span>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
							</svg>
						</button>
					</header>
					<section class="<?php echo esc_attr( "{$class_prefix}__modal__content" ); ?>">
						<div class="<?php echo esc_attr( "{$class_prefix}__selection" ); ?>" data-product-id="<?php echo esc_attr( $product_id ); ?>">
							<h3><?php echo esc_html( $product_name ); ?></h3>
							<p><?php esc_html_e( 'Select an option to continue:', 'newspack-blocks' ); ?></p>
							<ul class="newspack-blocks__options"">
								<?php
								$variations = $product->get_available_variations( 'objects' );
								foreach ( $variations as $variation ) :
									$variation_id   = $variation->get_id();
									$variation_name = wc_get_formatted_variation( $variation, true );
									$price          = $variation->get_price();
									$price_html     = $variation->get_price_html();
									$frequency      = '';

									// Use suggested price if NYP is active and set for variation.
									if ( \Newspack_Blocks::can_use_name_your_price() && \WC_Name_Your_Price_Helpers::is_nyp( $variation_id ) ) {
										$price = \WC_Name_Your_Price_Helpers::get_suggested_price( $variation_id );
									}

									if ( class_exists( '\WC_Subscriptions_Product' ) && \WC_Subscriptions_Product::is_subscription( $variation ) ) {
										$frequency = \WC_Subscriptions_Product::get_period( $variation );
									}

									$name = sprintf(
										/* translators: 1: variable product name, 2: product variation name */
										__( '%1$s - %2$s', 'newspack-blocks' ),
										$product_name,
										$variation_name
									);
									$product_price_summary = self::get_summary_card_price_string( $name, $price, $frequency );
									$product_data          = [
										'product_price_summary' => $product_price_summary,
										'product_id'   => $product_id,
										'variation_id' => $variation_id,
									];

									// Replace nyp price html for variations.
									if ( class_exists( '\WC_Name_Your_Price_Helpers' ) && \WC_Name_Your_Price_Helpers::is_nyp( $variation->get_id() ) ) {
										$price_html = str_replace( ':', '', $price_html );
										$price_html = str_replace( '<span class="suggested-text">', '<span class="suggested-text"><span class="suggested-prefix">', $price_html );
										$price_html = str_replace( '<span class="woocommerce-Price-amount amount">', '</span><span class="woocommerce-Price-amount amount">', $price_html );
									}
									?>
									<li class="newspack-blocks__options__item"">
										<div class="summary">
											<span class="price"><?php echo $price_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
										</div>
										<div class="variation"><?php echo esc_html( $variation_name ); ?></div>
										<form data-product="<?php echo esc_attr( wp_json_encode( $product_data ) ); ?>">
											<input type="hidden" name="newspack_checkout" value="1" />
											<input type="hidden" name="product_id" value="<?php echo esc_attr( $variation->get_id() ); ?>" />
											<button type="submit" class="<?php echo esc_attr( "{$class_prefix}__button {$class_prefix}__button--primary" ); ?>"><?php echo esc_html( self::get_modal_checkout_labels( 'checkout_confirm_variation' ) ); ?></button>
										</form>
									</li>
								<?php endforeach; ?>
							</ul>
						</div>
					</section>
				</div>
			</div>
			<?php
		}
		remove_filter( 'woocommerce_subscriptions_product_price_string', [ __CLASS__, 'update_subscriptions_product_price_string' ], 10, 1 );
		remove_filter( 'formatted_woocommerce_price', [ __CLASS__, 'maybe_remove_decimal_spaces' ], 10, 1 );
	}

	/**
	 * Enqueue scripts for the checkout page rendered in a modal.
	 */
	public static function enqueue_scripts() {
		if ( ( ! function_exists( 'is_checkout' ) || ! is_checkout() ) && ( ! function_exists( 'is_order_received_page' ) || ! is_order_received_page() ) ) {
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
				'ajax_url'              => admin_url( 'admin-ajax.php' ),
				'nyp_nonce'             => wp_create_nonce( 'newspack_checkout_name_your_price' ),
				'newspack_class_prefix' => self::get_class_prefix(),
				'is_checkout_complete'  => function_exists( 'is_order_received_page' ) && is_order_received_page(),
				'labels'                => [
					'billing_details'  => self::get_modal_checkout_labels( 'billing_details' ),
					'shipping_details' => self::get_modal_checkout_labels( 'shipping_details' ),
					'gift_recipient'   => self::get_modal_checkout_labels( 'gift_recipient' ),
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
		wp_localize_script(
			'newspack-blocks-modal',
			'newspackBlocksModal',
			[
				'newspack_class_prefix' => self::get_class_prefix(),
				'labels'                => [
					'auth_modal_title'     => self::get_modal_checkout_labels( 'auth_modal_title' ),
					'checkout_modal_title' => self::get_modal_checkout_labels( 'checkout_modal_title' ),
					'register_modal_title' => self::get_modal_checkout_labels( 'register_modal_title' ),
					'signin_modal_title'   => self::get_modal_checkout_labels( 'signin_modal_title' ),
					'thankyou_modal_title' => self::get_modal_checkout_labels( 'checkout_success' ),
				],
			]
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
		if ( ! function_exists( 'is_checkout' ) || ! function_exists( 'is_order_received_page' ) || ! function_exists( 'is_cart' ) ) {
			return $template;
		}
		if ( ! is_checkout() && ! is_order_received_page() && ! is_cart() ) {
			return $template;
		}
		if ( ! self::is_modal_checkout() ) {
			return $template;
		}
		$class_prefix = self::get_class_prefix();
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
			<body class="<?php echo esc_attr( "$class_prefix {$class_prefix}__modal__content" ); ?>" id="newspack_modal_checkout_container">
			<?php
				echo do_shortcode( '[woocommerce_checkout]' );
				wp_footer();
			?>

			<?php
			if ( is_cart() ) {
				self::render_close_button();
			}
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
				'after_success_behavior'     => isset( $_REQUEST['after_success_behavior'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['after_success_behavior'] ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'after_success_url'          => isset( $_REQUEST['after_success_url'] ) ? sanitize_url( wp_unslash( $_REQUEST['after_success_url'] ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				'after_success_button_label' => isset( $_REQUEST['after_success_button_label'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['after_success_button_label'] ) ) : '', // phpcs:ignore WordPress.Security.NonceVerification.Recommended
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
			'checkout/form-coupon.php'            => 'src/modal-checkout/templates/form-coupon.php',
			'checkout/form-gift-subscription.php' => 'src/modal-checkout/templates/form-gift-subscription.php',
		];

		// If Newspack UI is present, use our templates.
		if ( self::get_class_prefix() === 'newspack-ui' ) {
			// Replace the login form with the order summary if using the modal checkout. This is
			// for the case where the reader used an existing email address.
			$custom_templates['global/form-login.php']       = 'src/modal-checkout/templates/thankyou.php';
			$custom_templates['checkout/form-checkout.php']  = 'src/modal-checkout/templates/form-checkout.php';
			$custom_templates['checkout/payment-method.php'] = 'src/modal-checkout/templates/payment-method.php';
			$custom_templates['checkout/thankyou.php']       = 'src/modal-checkout/templates/thankyou.php';
		}

		// Only show the woocommerce-subscriptions-gifting fields when we want to.
		if ( 'html-add-recipient.php' === $template_name ) {
			$cart_items = \WC()->cart->get_cart();

			// If there's only one cart item, prefer our custom gift UI. Otherwise, use the default.
			if ( 1 === count( array_values( $cart_items ) ) && class_exists( 'WCS_Gifting' ) ) {
				$custom_templates['html-add-recipient.php'] = 'src/modal-checkout/templates/empty-html-add-recipient.php';
			}
		}

		foreach ( $custom_templates as $original_template => $custom_template ) {
			if ( $template_name === $original_template ) {
				$located = NEWSPACK_BLOCKS__PLUGIN_DIR . $custom_template;
			}
		}

		// This is for the initial display – the markup will be refetched on cart updates (e.g. applying a coupon).
		// Then it'd be handled by the `woocommerce_update_order_review_fragments` filter.
		if ( 'checkout/review-order.php' === $template_name && ! self::should_show_order_details() ) {
			$located = NEWSPACK_BLOCKS__PLUGIN_DIR . 'src/modal-checkout/templates/empty-order-details.php';
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

		/**
		 * Add the form-row-last CSS class to billing phone field.
		 */
		$fields['billing']['billing_phone']['class'] = 'form-row-last';

		return $fields;
	}

	/**
	 * If WooCommerce Subscriptions Gifting extension is available, render its fields.
	 *
	 * @return string HTML for the WooCommerce Subscriptions Gifting fields.
	 */
	public static function maybe_show_wcs_gifting_fields() {
		if ( ! self::is_modal_checkout() ) {
			return;
		}

		// Add custom Gift Subscriptions fields if needed.
		$cart_items = array_values( \WC()->cart->get_cart() );
		if (
			1 === count( $cart_items ) &&
			method_exists( 'WCSG_Cart', 'is_giftable_item' ) &&
			method_exists( 'WCSG_Cart', 'contains_gifted_renewal' ) &&
			function_exists( 'wcs_cart_contains_renewal' )
		) {
			$cart_item = reset( $cart_items );
			if ( \WCSG_Cart::is_giftable_item( $cart_item ) ) {
				$email = ( empty( $cart_item['wcsg_gift_recipients_email'] ) ) ? '' : $cart_item['wcsg_gift_recipients_email'];
				$args  = [
					'email'      => $email,
					'is_renewal' => false,
				];

				if ( \WCSG_Cart::contains_gifted_renewal() ) {
					$recipient_user_id = \WCSG_Cart::get_recipient_from_cart_item( \wcs_cart_contains_renewal() );
					$recipient_user    = \get_userdata( $recipient_user_id );
					if ( $recipient_user && isset( $recipient_user->email ) ) {
						$args['email']      = $recipient_user->user_email;
						$args['is_renewal'] = true;
					}
				}

				\wc_get_template( 'checkout/form-gift-subscription.php', $args );
			}
		}
	}

	/**
	 * If the WooCommerce Subscriptions Gifting extension is available, handle custom form inputs.
	 */
	public static function wcsg_apply_gift_subscription() {
		$cart_items = \WC()->cart->get_cart();
		if (
			1 === count( array_values( $cart_items ) ) &&
			method_exists( 'WCS_Gifting', 'email_belongs_to_current_user' ) &&
			method_exists( 'WCS_Gifting', 'update_cart_item_key' ) &&
			method_exists( 'WCSG_Cart', 'is_giftable_item' )
		) {
			$is_gift   = ! empty( filter_input( INPUT_POST, 'newspack_wcsg_is_gift', FILTER_SANITIZE_SPECIAL_CHARS ) );
			$cart_item_key = array_keys( $cart_items )[0];
			$cart_item     = array_values( $cart_items )[0];
			if ( $is_gift && \WCSG_Cart::is_giftable_item( $cart_item ) ) {
				$recipient_email = \sanitize_email( filter_input( INPUT_POST, 'wcsg_gift_recipients_email', FILTER_SANITIZE_EMAIL ) );
				$self_gifting    = \WCS_Gifting::email_belongs_to_current_user( $recipient_email );
				$is_valid_email  = ! $self_gifting && \is_email( $recipient_email );

				// If no errors, attach the recipient's email address to the subscription item.
				if ( $is_valid_email ) {
					\WCS_Gifting::update_cart_item_key( $cart_item, $cart_item_key, $recipient_email );
				} else {
					$notice = $self_gifting
						? __( 'Please enter someone else\' email address to receive this gift.', 'newspack-blocks' )
						: __( 'Please enter a valid email address to receive this gift.', 'newspack-blocks' );

					// Handle email validation errors.
					\wc_add_notice(
						$notice,
						'error',
						[ 'id' => 'wcsg_gift_recipients_email' ]
					);
				}
			}
		}
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
		if ( ! empty( $cart->get_fees() ) ) {
			return true;
		}
		if ( $cart->needs_shipping_address() ) {
			$shipping       = \WC()->shipping;
			$packages       = $shipping->get_packages();
			$totals         = $cart->get_totals();
			$shipping_rates = [];

			// Find all the shipping rates that apply to the current transaction.
			foreach ( $packages as $package ) {
				if ( ! empty( $package['rates'] ) ) {
					foreach ( $package['rates'] as $rate_key => $rate ) {
						$shipping_rates[ $rate_key ] = $rate;
					}
				}
			}

			// Show details if shipping requires a fee or if there are multiple shipping rates to choose from.
			if ( (float) $totals['total'] !== (float) $totals['subtotal'] || 1 < count( array_values( $shipping_rates ) ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Customize order review fragments on cart updates.
	 *
	 * @param array $fragments Fragments.
	 *
	 * @return array
	 */
	public static function order_review_fragments( $fragments ) {
		if ( ! self::is_modal_checkout() ) {
			return $fragments;
		}
		if ( ! self::should_show_order_details() ) {
			// Render an empty table so WC knows how to replace it on updates.
			$fragments['.woocommerce-checkout-review-order-table'] = '<table class="shop_table woocommerce-checkout-review-order-table empty"></table>';
		}
		return $fragments;
	}

	/**
	 * Render a generic button to close the modal.
	 *
	 * @param string $button_label The button label.
	 */
	private static function render_close_button( $button_label = '' ) {
		if ( ! $button_label ) {
			$button_label = __( 'Close window', 'newspack-blocks' );
		}
		?>
			<div class="button-container">
				<a
					onclick="parent.newspackCloseModalCheckout(this);"
					class="button close-button"
				>
					<?php echo esc_html( $button_label ); ?>
				</a>
			</div>
		<?php
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
	 * Ensure that the modal_checkout param is passed if we get redirected while inside the modal.
	 * This is so that we can continue hiding site elements that we don't want to show inside the modal.
	 *
	 * @param string $location The path or URL to redirect to.
	 *
	 * @return string
	 */
	public static function pass_url_param_on_redirect( $location ) {
		if ( self::is_modal_checkout() ) {
			$location = \add_query_arg( [ 'modal_checkout' => 1 ], $location );
		}
		return $location;
	}

	/**
	 * Filters the error message shown when a product can't be added to the cart.
	 *
	 * @param string     $message Message.
	 * @param WC_Product $product_data Product data.
	 *
	 * @return string
	 */
	public static function woocommerce_cart_product_cannot_be_purchased_message( $message, $product_data ) {
		if ( method_exists( 'WCS_Limiter', 'is_purchasable' ) ) {
			$product = \wc_get_product( $product_data->get_id() );
			if ( ! \WCS_Limiter::is_purchasable( false, $product ) ) {
				$message .= ' ' . __( 'You may only have one subscription of this product at a time.', 'newspack-blocks' );
			}
		}

		return $message;
	}

	/**
	 * Is this request using the modal checkout?
	 */
	public static function is_modal_checkout() {

		$is_modal_checkout = isset( $_REQUEST['modal_checkout'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! $is_modal_checkout && isset( $_REQUEST['post_data'] ) && is_string( $_REQUEST['post_data'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$is_modal_checkout = strpos( $_REQUEST['post_data'], 'modal_checkout=1' ) !== false; // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.MissingUnslash, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		}

		// Express checkout payment requests are separate requests, so they won't have the modal checkout flag. We'll have to check the HTTP_REFERER insteaad.
		$payment_request_type = filter_input( INPUT_POST, 'payment_request_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS );
		$is_express_checkout  = ! empty( $payment_request_type ) && in_array( $payment_request_type, [ 'apple_pay', 'google_pay', 'payment_request_api' ], true ); // Validate payment request types: https://github.com/woocommerce/woocommerce-gateway-stripe/blob/develop/includes/payment-methods/class-wc-stripe-payment-request.php#L529-L548.
		if ( $is_express_checkout ) {
			$referrer = isset( $_SERVER['HTTP_REFERER'] ) ? \esc_url_raw( \wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : false; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			if ( $referrer ) {
				$referrer_query = \wp_parse_url( $referrer, PHP_URL_QUERY );
				\wp_parse_str( $referrer_query, $referrer_query_params );
				if ( isset( $referrer_query_params['modal_checkout'] ) && $referrer_query_params['modal_checkout'] ) {
					$is_modal_checkout = true;
				}
			}
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
		$total = \wp_strip_all_tags( \wc_price( $cart->total ) );

		return sprintf(
			/* translators: 1: Checkout button confirmation text. 2: Order total. */
			__( '%1$s: %2$s', 'newspack-blocks' ),
			self::get_modal_checkout_labels( 'checkout_confirm' ),
			$total
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
		$class_prefix = self::get_class_prefix();
		?>
			<div class="<?php echo esc_attr( "order-details-summary {$class_prefix}__box {$class_prefix}__box--text-center" ); ?>">
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
	 * Render name your price form if nyp is active and available.
	 */
	public static function render_name_your_price_form() {
		if ( ! self::is_modal_checkout() || ! function_exists( 'WC' ) || ! method_exists( '\WC_Name_Your_Price_Helpers', 'is_nyp' ) ) {
			return;
		}

		// Only show nyp form for checkout button modal checkout.
		$is_donation = method_exists( 'Newspack\Donations', 'is_donation_cart' ) && \Newspack\Donations::is_donation_cart();
		if ( $is_donation ) {
			return;
		}

		$cart = \WC()->cart;
		if ( 1 !== $cart->get_cart_contents_count() ) {
			return;
		}
		$class_prefix = self::get_class_prefix();
		?>
			<div class="name-your-price">
				<?php
				// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WooCommerce hooks.
				foreach ( $cart->get_cart() as $cart_item_key => $cart_item ) :
					$_product = apply_filters( 'woocommerce_cart_item_product', $cart_item['data'], $cart_item, $cart_item_key );
					if ( ! $_product || ! $_product->exists() || $cart_item['quantity'] <= 0 || ! \WC_Name_Your_Price_Helpers::is_nyp( $_product ) || ! apply_filters( 'woocommerce_checkout_cart_item_visible', true, $cart_item, $cart_item_key ) ) {
						continue;
					}
					$currency_symbol = \get_woocommerce_currency_symbol();
					$product_id      = $_product->get_id();
					$price           = $_product->get_price();
					?>
					<form class="modal_checkout_nyp">
						<h3><?php echo esc_html( self::get_modal_checkout_labels( 'checkout_nyp_title' ) ); ?></h3>
						<input type="hidden" name="newspack_checkout_name_your_price" value="1" />
						<input type="hidden" name="product_id" value="<?php echo esc_attr( $product_id ); ?>" />
						<p class="input-price" >
							<label for="price">
								<span class="currency"><?php echo esc_html( $currency_symbol ); ?></span>
								<input type="number" min="0" step=".01" name="price" placeholder="<?php echo esc_attr( $price ); ?>" onwheel="return false" />
							</label>
							<button type="submit" class="<?php echo esc_attr( "{$class_prefix}__button {$class_prefix}__button--outline" ); ?>">
								<?php echo esc_html( self::get_modal_checkout_labels( 'checkout_nyp_apply' ) ); ?>
							</button>
						</p>
						<p class="result <?php echo esc_attr( "{$class_prefix}__helper-text" ); ?>">
							<?php echo esc_attr( self::get_modal_checkout_labels( 'checkout_nyp' ) ); ?>
						</p>
					</form>
					<?php
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
	 * Maybe disable order notes in the modal checkout.
	 *
	 * @param bool $enable Whether to enable the order notes field.
	 *
	 * @return bool
	 */
	public static function enable_order_notes_field( $enable ) {
		if ( self::is_modal_checkout() ) {
			$cart = \WC()->cart;
			$billing_fields = apply_filters( 'newspack_blocks_donate_billing_fields_keys', [], $cart );
			return in_array( 'order_comments', $billing_fields, true );
		}
		return $enable;
	}

	/**
	 * Force option for base country for new customers if unset and billing country optional while state is required
	 * unless the NEWSPACK_PREVENT_FORCE_BASE_DEFAULT_CUSTOMER_ADDRESS constant is set.
	 *
	 * If this option is empty AND billing state is set as a required field AND billing country is not,
	 * validation of the state value will fail during modal checkout.
	 *
	 * See Default Customer Location in: https://woo.com/document/configuring-woocommerce-settings/#general-options
	 *
	 * @param string $option_value The value of the default customer address option.
	 *
	 * @return string Option value.
	 */
	public static function ensure_base_default_customer_address( $option_value ) {
		// If the option is set, we're good.
		if ( ! empty( $option_value ) ) {
			return $option_value;
		}

		// Only in modal checkout.
		if ( ! self::is_modal_checkout() ) {
			return $option_value;
		}

		// Escape hatch in case we want the standard behavior even in modal checkout.
		if ( defined( 'NEWSPACK_PREVENT_FORCE_BASE_DEFAULT_CUSTOMER_ADDRESS' ) && NEWSPACK_PREVENT_FORCE_BASE_DEFAULT_CUSTOMER_ADDRESS ) {
			return $option_value;
		}

		// If billing state is required but billing country is not, we need to ensure a default location is set.
		if ( defined( '\Newspack\Donations::DONATION_BILLING_FIELDS_OPTION' ) ) {
			$billing_fields = get_option( \Newspack\Donations::DONATION_BILLING_FIELDS_OPTION, [] );
			if ( ! in_array( 'billing_country', $billing_fields, true ) && in_array( 'billing_state', $billing_fields, true ) ) {
				return 'base';
			}
		}

		return $option_value;
	}

	/**
	 * If a reader tries to make a purchase with an email address that
	 * has been previously registered, automatically associate the transaction
	 * with the user.
	 *
	 * @param int $customer_id Current customer ID.
	 *
	 * @return int Modified $customer_id
	 */
	public static function associate_existing_user( $customer_id ) {
		if ( ! self::is_modal_checkout() ) {
			return $customer_id;
		}
		$billing_email = filter_input( INPUT_POST, 'billing_email', FILTER_SANITIZE_EMAIL );
		if ( $billing_email ) {
			$customer = \get_user_by( 'email', $billing_email );
			if ( $customer ) {
				$customer_id = $customer->ID;
			}
		}
		return $customer_id;
	}

	/**
	 * Don't force account registration/login on Woo purchases for existing users.
	 *
	 * @param array $data Array of Woo checkout data.
	 *
	 * @return array Modified $data.
	 */
	public static function skip_account_creation( $data ) {
		if ( ! self::is_modal_checkout() ) {
			return $data;
		}
		$email    = $data['billing_email'];
		$customer = \get_user_by( 'email', $email );
		if ( $customer ) {
			$data['createaccount'] = 0;
			\add_filter( 'woocommerce_checkout_registration_required', '__return_false', 9999 );
		}

		return $data;
	}

	/**
	 * The value for the custom WooCommerce Subscriptions Gifting Extension checkbox label.
	 *
	 * @return string Gift checkbox label.
	 */
	public static function subscriptions_gifting_label() {
		$is_donation = method_exists( 'Newspack\Donations', 'is_donation_cart' ) && \Newspack\Donations::is_donation_cart();
		$label       = $is_donation ? self::get_modal_checkout_labels( 'donation_gift_details' ) : self::get_modal_checkout_labels( 'purchase_gift_details' );
		return \apply_filters( 'wcsg_enable_gifting_checkbox_label', $label ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WooCommerce hooks.
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

	/**
	 * Get the relevant class prefix (newspack-blocks or newspack-ui) depending on whether Newpack plugin is active.
	 */
	private static function get_class_prefix() {
		return class_exists( '\Newspack\Newspack_UI' ) ? 'newspack-ui' : 'newspack-blocks';
	}

	/**
	 * Add newspack ui classes to the "Place order" button html.
	 *
	 * @param string $html The button html.
	 */
	public static function order_button_html( $html ) {
		if ( ! self::is_modal_checkout() ) {
			return $html;
		}

		$class_prefix = self::get_class_prefix();

		$newspack_ui_html = preg_replace( '/class=".*?"/', "class='{$class_prefix}__button {$class_prefix}__button--primary {$class_prefix}__button--wide'", $html );

		return $newspack_ui_html;
	}

	/**
	 * Get modal checkout flow labels.
	 *
	 * @param string|null $key Key of the label to return (optional).
	 *
	 * @return string[]|string The label string or an array of labels keyed by string.
	 */
	public static function get_modal_checkout_labels( $key = null ) {
		if ( empty( self::$modal_checkout_labels ) ) {
			$default_labels = [
				'billing_details'            => __( 'Billing details', 'newspack-blocks' ),
				'shipping_details'           => __( 'Shipping details', 'newspack-blocks' ),
				'gift_recipient'             => __( 'Gift recipient', 'newspack-blocks' ),
				'checkout_modal_title'       => __( 'Complete your transaction', 'newspack-blocks' ),
				'variation_modal_title'      => __( 'Complete your transaction', 'newspack-blocks' ),
				'auth_modal_title'           => __( 'Complete your transaction', 'newspack-blocks' ),
				'signin_modal_title'         => _x(
					'Sign in to complete transaction',
					'Login modal title when logged out user attempts to checkout.',
					'newspack-blocks'
				),
				'register_modal_title'       => _x(
					'Register to complete transaction',
					'Login modal title when unregistered user attempts to checkout',
					'newspack-blocks'
				),
				'after_success'              => __( 'Continue browsing', 'newspack-blocks' ),
				'donation_gift_details'      => __( 'This donation is a gift', 'newspack-blocks' ),
				'purchase_gift_details'      => __( 'This purchase is a gift', 'newspack-blocks' ),
				'checkout_confirm'           => __( 'Complete transaction', 'newspack-blocks' ),
				'checkout_confirm_variation' => __( 'Purchase', 'newspack-blocks' ),
				'checkout_back'              => __( 'Back', 'newspack-blocks' ),
				'checkout_success'           => __( 'Transaction successful', 'newspack-blocks' ),
				'thankyou'                   => sprintf(
					// Translators: %s is the site name.
					__( 'Thank you for supporting %s. Your transaction was successful.', 'newspack-blocks' ),
					get_option( 'blogname' )
				),
				'checkout_nyp'               => __( "Your contribution directly funds our work. If you're moved to do so, you can opt to pay more than the standard rate.", 'newspack-blocks' ),
				'checkout_nyp_thankyou'      => __( "Thank you for your generosity! We couldn't do this without you!", 'newspack-blocks' ),
				'checkout_nyp_title'         => __( 'Increase your support', 'newspack-blocks' ),
				'checkout_nyp_apply'         => __( 'Apply', 'newspack-blocks' ),
			];

			/**
			* Filters the global labels for modal checkout flow.
			*
			* @param mixed[] $labels Labels keyed by name.
			*/
			$filtered_labels = apply_filters( 'newspack_blocks_modal_checkout_labels', $default_labels );

			// Merge the default and filtered labels to ensure there are no missing labels.
			self::$modal_checkout_labels = array_merge( $default_labels, $filtered_labels );
		}

		if ( ! $key ) {
			return self::$modal_checkout_labels;
		}

		return self::$modal_checkout_labels[ $key ] ?? '';
	}


	/**
	 * Get price string for the price summary card to render in auth flow.
	 *
	 * @param string $name      The name.
	 * @param string $price     The price. Optional. If not provided, the price string will contain 0.
	 * @param string $frequency The frequency. Optional. If not provided, the price will be treated as a one-time payment.
	 */
	public static function get_summary_card_price_string( $name, $price = '', $frequency = '' ) {
		if ( ! $price ) {
			$price = '0';
		}

		if ( function_exists( 'wcs_price_string' ) && function_exists( 'wc_price' ) ) {
			if ( $frequency && $frequency !== 'once' ) {
				$price = wp_strip_all_tags(
					wcs_price_string(
						[
							'recurring_amount'    => $price,
							'subscription_period' => $frequency,
							'use_per_slash'       => true,
						]
					)
				);
			} else {
				$price = wp_strip_all_tags( wc_price( $price ) );
			}
		}

		// translators: 1 is the name of the item. 2 is the price of the item.
		return sprintf( __( '%1$s: %2$s', 'newspack-blocks' ), $name, $price );
	}
}
Modal_Checkout::init();
