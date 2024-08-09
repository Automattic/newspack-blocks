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
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION = 'form_submission_received';

	/**
	 * The name of the action for form submissions
	 */
	const FORM_SUBMISSION_SUCCESS = 'form_submission_success';

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
		if ( ! method_exists( 'Newspack\Data_Events', 'register_listener' ) ) {
			return;
		}

		/*
		\Newspack\Data_Events::register_listener(
			'newspack_blocks_checkout_button_modal',
			'modal_checkout_interaction',
			[ __CLASS__, 'checkout_button_purchase' ]
		);

		\Newspack\Data_Events::register_listener(
			'newspack_blocks_donate_block_modal',
			'modal_checkout_interaction',
			[ __CLASS__, 'donate_button_purchase' ]
		);
		*/

		\Newspack\Data_Events::register_listener(
			'woocommerce_checkout_order_created',
			'modal_checkout_interaction',
			[ __CLASS__, 'checkout_attempt' ]
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
	 * TK
	 *
	 * @param string $product_id Product's ID.
	 */
	public static function build_js_data_events( $product_id, $cart_item ) {
		if ( ! method_exists( 'Newspack\Data_Events', 'register_listener' ) ) {
			return '';
		}

		// Set action type to the kind of purchase: product, subscription, or donation.
		$action_type  = 'product';
		$recurrence = 'once';

		// Check if is a subscription product.
		$recurrence = self::get_purchase_recurrence( $product_id );
		if ( 'once' !== $recurrence ) {
			$action_type = 'subscription';
		}

		// Check if is a donation product.
		if ( method_exists( 'Newspack\Donations', 'is_donation_product' ) ) {
			if ( \Newspack\Donations::is_donation_product( $product_id ) ) {
				$action_type = 'donation';
			}
		}

		$data_order_details = [
			'action_type'  => $action_type, // donation, subscription, regular product
			'product_id'   => $product_id,
			'amount'       => $cart_item['data']->get_price(),
			'currency'     => \get_woocommerce_currency(),
			'referer'      => $cart_item['referer'],
			'recurrence'   => $recurrence,
		];

		return $data_order_details;
	}

	/**
	 * Fires when a reader opens the modal checkout from a checkout button block.
	 *
	 * @param array $checkout_button_metadata Information about the purchase.
	 *
	 * @return ?array
	 */
	public static function checkout_button_purchase( $checkout_button_metadata ) {
		$metadata = [];
		foreach ( $checkout_button_metadata as $key => $value ) {
			$metadata[ $key ] = $value;
		}

		$data = [
			'action'      => self::FORM_SUBMISSION_SUCCESS,
			'action_type' => 'paid_membership',
			'recurrence'  => self::get_purchase_recurrence( $metadata['product_id'] ),
		];

		$data = array_merge( $data, $metadata );

		return $data;
	}

	/**
	 * Fires when a reader opens the modal checkout from a donate block.
	 *
	 * @param array $donation_metadata Information about the donation.
	 *
	 * @return ?array
	 */
	public static function donate_button_purchase( $donation_metadata ) {
		$metadata = [];
		foreach ( $donation_metadata as $key => $value ) {
			$metadata[ $key ] = $value;
		}

		$data = [
			'action'      => self::FORM_SUBMISSION_SUCCESS,
			'action_type' => 'donation',
			'recurrence'  => self::get_purchase_recurrence( $metadata['product_id'] ),
		];

		$data = array_merge( $data, $metadata );

		return $data;
	}

	/**
	 * Fires when a reader attempts to complete an order with the modal checkout.
	 *
	 * @param array $order WooCommerce order information.
	 *
	 * @return ?array
	 *
	 * TODO: Move to front end -- check-out attempt
	 */
	public static function checkout_attempt( $order ) {
		$order_data = \Newspack\Data_Events\Utils::get_order_data( $order->get_id(), true );

		if ( empty( $order_data ) ) {
			return;
		}

		$data = [
			'action'     => self::FORM_SUBMISSION,
			'order_id'   => $order->get_id(),
			'amount'     => $order->get_total(),
			'currency'   => $order->get_currency(),
			'recurrence' => $order_data['recurrence'],
			'product_id' => $order_data['platform_data']['product_id'],
		];
		return $data;
	}
}
Data_Events::init();