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
	 * Returns an array of product information.
	 *
	 * @param string $product_id Product's ID.
	 * @param array  $cart_item Cart item.
	 */
	public static function build_js_data_events( $product_id, $cart_item ) {
		// Set action type to the kind of purchase: product, subscription, or donation.
		$action_type  = 'product';
		$recurrence = 'once';

		// Check if it's a subscription product.
		$recurrence = self::get_purchase_recurrence( $product_id );
		if ( 'once' !== $recurrence ) {
			$action_type = 'subscription';
		}

		// Check if it's a donation product.
		if ( method_exists( 'Newspack\Donations', 'is_donation_product' ) ) {
			if ( \Newspack\Donations::is_donation_product( $product_id ) ) {
				$action_type = 'donation';
			}
		}

		$data_order_details = [
			'action_type' => $action_type,
			'product_id'  => $product_id,
			'amount'      => $cart_item['data']->get_price(),
			'currency'    => \get_woocommerce_currency(),
			'referer'     => $cart_item['referer'],
			'recurrence'  => $recurrence,
		];

		return $data_order_details;
	}
}
Data_Events::init();
