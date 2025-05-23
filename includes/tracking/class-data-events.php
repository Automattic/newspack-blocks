<?php
/**
 * Newspack Blocks Tracking Data Events Integration.
 *
 * @package Newspack
 */

namespace Newspack_Blocks\Tracking;

use Newspack_Blocks\Modal_Checkout;

/**
 * Tracking Data Events Class.
 */
final class Data_Events {

	/**
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION_SUCCESS = 'form_submission_success';

	/**
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION_FAILURE = 'form_submission_failure';

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_action( 'plugins_loaded', [ __CLASS__, 'register_listeners' ] );
	}

	/**
	 * Register listeners.
	 */
	public static function register_listeners() {
		if ( ! method_exists( 'Newspack\Data_Events', 'register_handler' ) ) {
			return;
		}

		/**
		 * Modal Checkout Interation: Completed Order.
		 */
		\Newspack\Data_Events::register_listener(
			'woocommerce_checkout_order_processed',
			'modal_checkout_interaction',
			[ __CLASS__, 'order_status_completed' ]
		);
	}

	/**
	 * Returns whether a product is a one time purchase, or recurring and when.
	 *
	 * @param string $product_id Product's ID.
	 */
	public static function get_purchase_recurrence( $product_id ) {
		$recurrence = get_post_meta( $product_id, '_subscription_period', true );
		if ( empty( $recurrence ) ) {
			$recurrence = 'once';
		}
		return $recurrence;
	}

	/**
	 * Returns whether a product ID is associated with a membership.
	 *
	 * @param string $product_id Product's ID.
	 */
	public static function is_membership_product( $product_id ) {
		if ( ! function_exists( 'wc_memberships_get_membership_plans' ) ) {
			return false;
		}
		$membership_plans = wc_memberships_get_membership_plans();
		$plans            = [];

		foreach ( $membership_plans as $plan ) {
			$subscription_plan  = new \WC_Memberships_Integration_Subscriptions_Membership_Plan( $plan->get_id() );
			$required_products = $subscription_plan->get_subscription_product_ids();
			if ( in_array( $product_id, $required_products ) ) {
				return true;
			}
		}
		return false;
	}


	/**
	 * Returns the product type: product, subscription, donation, or membership.
	 * TODOGA4: move this check & related functions into a more central location, and update based on final decision for product types.
	 *
	 * @param string $product_id Product's ID.
	 */
	public static function get_product_type( $product_id ) {
		$product_type = 'product';
		$recurrence   = self::get_purchase_recurrence( $product_id );

		// Check if it's a subscription product.
		if ( 'once' !== $recurrence ) {
			$product_type = 'subscription';
		}

		// Check if it's a membership product.
		if ( self::is_membership_product( $product_id ) ) {
			$product_type = 'membership';
		}

		// Check if it's a donation product.
		if ( method_exists( 'Newspack\Donations', 'is_donation_product' ) ) {
			if ( \Newspack\Donations::is_donation_product( $product_id ) ) {
				$product_type = 'donation';
			}
		}

		return $product_type;
	}

	/**
	 * Returns the action type: checkout_button or donation.
	 *
	 * @param string $product_id Product's ID.
	 */
	public static function get_action_type( $product_id ) {
		$action_type = 'checkout_button';
		// Check if it's a donation product, and update action_type, product_type.
		if ( method_exists( 'Newspack\Donations', 'is_donation_product' ) ) {
			if ( \Newspack\Donations::is_donation_product( $product_id ) ) {
				$action_type = 'donation';
			}
		}
		return $action_type;
	}

	/**
	 * Returns checkout data given a product, product variation, cart or order object.
	 *
	 * @param \WC_Product|\WC_Product_Variation|\WC_Cart|\WC_Order $source Product, product variation, cart or order object.
	 *
	 * @return array
	 */
	public static function get_checkout_data( $source ) {
		$data = [];
		if ( empty( $source ) ) {
			return $data;
		}

		$cart_item    = null;
		$order        = null;
		$referrer     = '';

		if ( $source instanceof \WC_Product_Variation ) {
			$product_id = $source->get_parent_id();
			$variation_id = $source->get_id();
			$amount = $source->get_price();
		} elseif ( $source instanceof \WC_Product ) {
			$product_id = $source->get_id();
			if ( $source->get_parent_id() ) {
				$product_id   = $source->get_parent_id();
				$variation_id = $source->get_id();
			}
			$amount = $source->get_price();
		} elseif ( $source instanceof \WC_Cart ) {
			$cart_item    = reset( $source->get_cart() ); // Use only the first item in the cart.
			$product_id   = $cart_item['product_id'];
			$variation_id = $cart_item['variation_id'];
			$amount       = $cart_item['data']->get_price();
			$referrer     = $cart_item['referer'] ?? '';
		} elseif ( $source instanceof \WC_Order ) {
			$order        = $source;
			$order_item   = reset( $order->get_items() ); // Use only the first item in the order.
			$product_id   = $order_item->get_product_id();
			$variation_id = $order_item->get_variation_id();
			$amount       = $order_item->get_subtotal();
			$referrer     = $order->get_meta( '_newspack_referer' );
		}

		$product = wc_get_product( $product_id );
		if ( $variation_id ) {
			$variation_name = wc_get_formatted_variation( $source, true );
		}

		$product_type = self::get_product_type( $product_id );
		$recurrence   = self::get_purchase_recurrence( $product_id );

		/**
		 * Price summary.
		 */
		if ( 'donation' === $product_type ) {
			$name = __( 'Donate', 'newspack-blocks' );
		} elseif ( $variation_id ) {
			$name = sprintf(
				/* translators: 1: variable product name, 2: product variation name */
				__( '%1$s - %2$s', 'newspack-blocks' ),
				$product->get_name(),
				$variation_name
			);
		} else {
			$name = $product->get_name();
		}
		$price_summary = Modal_Checkout::get_summary_card_price_string( $name, $amount, $recurrence );

		$data = [
			'amount'                => $amount,
			'action_type'           => self::get_action_type( $product_id ),
			'currency'              => function_exists( 'get_woocommerce_currency' ) ? \get_woocommerce_currency() : 'USD',
			'product_id'            => strval( $product_id ? $product_id : '' ),
			'product_type'          => $product_type,
			'product_price_summary' => $price_summary,
			'referrer'              => $referrer ? str_replace( home_url(), '', $referrer ) : '', // Keeps format consistent for Homepage with Donate and Checkout Button blocks.
			'recurrence'            => $recurrence,
			'variation_id'          => strval( $variation_id ? $variation_id : '' ),
		];

		/**
		 * Order specific data.
		 */
		if ( $order ) {
			$data['order_id'] = $order->get_id();
			if ( 'subscription' === $product_type ) {
				$subscription_renewal = $order->get_meta( '_subscription_renewal' );
				if ( $subscription_renewal ) {
					$data['subscription_renewal'] = $subscription_renewal;
				}
				if ( function_exists( 'wcs_get_subscriptions_for_order' ) ) {
					$subscriptions = wcs_get_subscriptions_for_order( $order );
					if ( ! empty( $subscriptions ) ) {
						$data['subscription_ids'] = array_values(
							array_map(
								function( $subscription ) {
									return $subscription->get_id();
								},
								$subscriptions
							)
						);
					}
				}
			}
		}

		/**
		 * Gate and popup data.
		 */
		$gate_post_id = ! empty( $order ) ? $order->get_meta( '_memberships_content_gate' ) : filter_input( INPUT_GET, 'memberships_content_gate', FILTER_SANITIZE_NUMBER_INT );
		if ( $gate_post_id ) {
			$data['gate_post_id'] = $gate_post_id;
		}
		$newspack_popup_id = ! empty( $order ) ? $order->get_meta( '_newspack_popup_id' ) : filter_input( INPUT_GET, 'newspack_popup_id', FILTER_SANITIZE_NUMBER_INT );
		if ( $newspack_popup_id ) {
			$data['newspack_popup_id'] = $newspack_popup_id;
		}

		return $data;
	}

	/**
	 * Send data to GA4.
	 *
	 * @param string    $order_id Order's ID.
	 * @param array     $posted_data Posted Data.
	 * @param \WC_Order $order Order object.
	 */
	public static function order_status_completed( $order_id, $posted_data, $order ) {
		// Check if in a modal checkout; if no, bail.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$is_modal_checkout = ( isset( $_REQUEST['modal_checkout'] ) ? true : false );
		if ( ! $is_modal_checkout ) {
			return;
		}

		$data = \Newspack\Data_Events\Utils::get_order_data( $order_id );
		if ( empty( $data ) ) {
			return;
		}

		$product_id = is_array( $data['platform_data']['product_id'] ) ? $data['platform_data']['product_id'][0] : $data['platform_data']['product_id'];

		$data['action']       = self::FORM_SUBMISSION_SUCCESS;
		$data['action_type']  = self::get_action_type( $product_id );
		$data['product_id']   = $product_id;
		$data['product_type'] = self::get_product_type( $product_id );
		$data['recurrence']   = self::get_purchase_recurrence( $product_id );

		return $data;
	}
}
Data_Events::init();
