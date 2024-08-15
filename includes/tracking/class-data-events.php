<?php
/**
 * Newspack Blocks Tracking Data Events Integration.
 *
 * @package Newspack
 */

namespace Newspack_Blocks\Tracking;

/**
 * Tracking Data Events Class.
 */
final class Data_Events {

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

		\Newspack\Data_Events::register_listener(
			'woocommerce_order_status_completed',
			'modal_checkout_interaction',
			function ( $order_id, $order ) {
				return \Newspack\Data_Events\Utils::get_order_data( $order_id, true );
			}
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
	 * Returns an array of product information.
	 *
	 * @param string $product_id Product's ID.
	 * @param array  $cart_item Cart item.
	 */
	public static function build_js_data_events( $product_id, $cart_item ) {
		// Set action type to the kind of purchase: product, subscription, or donation.
		$action_type  = 'checkout_button';
		$recurrence   = 'once';
		$product_type = 'other';

		// Check if it's a donation product.
		if ( method_exists( 'Newspack\Donations', 'is_donation_product' ) ) {
			if ( \Newspack\Donations::is_donation_product( $product_id ) ) {
				$action_type = 'donation';
				$product_type = 'donation';
			}
		}

		// Check if it's associated with a membership.
		if ( self::is_membership_product( $product_id ) ) {
			$product_type = 'membership';
		}

		$data_order_details = [
			'amount'       => $cart_item['data']->get_price(),
			'action_type'  => $action_type,
			'currency'     => \get_woocommerce_currency(),
			'product_id'   => $product_id,
			'product_type' => $product_type,
			'referer'      => $cart_item['referer'],
			'recurrence'   => $recurrence,
		];

		return $data_order_details;
	}
}
Data_Events::init();
