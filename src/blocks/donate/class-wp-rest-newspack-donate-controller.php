<?php // phpcs:disable Squiz.Commenting.FileComment.Missing
/**
 * WP_REST_Newspack_Donate_Controller file.
 *
 * @package WordPress
 */

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedClassFound

/**
 * Class WP_REST_Newspack_Donate_Controller.
 */
class WP_REST_Newspack_Donate_Controller extends WP_REST_Controller {
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedClassFound

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->namespace = 'newspack-blocks/v1';
		$this->rest_base = 'donate';
	}

	/**
	 * Registers the necessary REST API routes.
	 *
	 * @access public
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => [ $this, 'charge' ],
					'args'                => [
						'tokenData' => [
							'type'       => 'object',
							'properties' => [
								'id' => [
									'type'              => 'string',
									'sanitize_callback' => 'sanitize_text_field',
									'required'          => true,
								],
							],
						],
						'amount'    => [
							'sanitize_callback' => function ( $amount ) {
								return (float) abs( $amount );
							},
							'required'          => true,
						],
						'frequency' => [
							'sanitize_callback' => 'sanitize_text_field',
							'required'          => true,
						],
						'email'     => [
							'sanitize_callback' => 'sanitize_text_field',
							'required'          => true,
						],
						'clientId'  => [
							'sanitize_callback' => 'sanitize_text_field',
						],
					],
					'permission_callback' => '__return_true',
				],
			]
		);
	}

	/**
	 * Process the amount. Some currencies are zero-decimal, but for others,
	 * the amount should be multiplied by 100 (100 USD is 100*100 currency units, aka cents).
	 * https://stripe.com/docs/currencies#zero-decimal
	 *
	 * @param number $amount Amount to process.
	 * @param strin  $currency Currency code.
	 * @return number Amount.
	 */
	private static function get_amount( $amount, $currency ) {
		$zero_decimal_currencies = [ 'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF' ];
		if ( in_array( $currency, $zero_decimal_currencies, true ) ) {
			return $amount;
		}
		return $amount * 100;
	}

	/**
	 * Charge a credit card.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function charge( $request ) {
		$response         = [
			'error'  => null,
			'status' => null,
		];
		$payment_metadata = [
			'Source'   => 'Newspack',
			'clientId' => $request->get_param( 'clientId' ),
		];
		$amount_raw       = $request->get_param( 'amount' );

		try {
			$stripe = \Newspack\Stripe_Connection::get_stripe_client();

			$frequency     = $request->get_param( 'frequency' );
			$token_data    = $request->get_param( 'tokenData' );
			$email_address = $request->get_param( 'email' );

			// Find or create the customer by email.
			$found_customers = $stripe->customers->all( [ 'email' => $email_address ] )['data'];
			$customer        = count( $found_customers ) ? $found_customers[0] : null;
			if ( null === $customer ) {
				$customer = $stripe->customers->create(
					[
						'email'       => $email_address,
						'description' => __( 'Newspack Donor', 'newspack-blocks' ),
						'source'      => $token_data['id'],
					]
				);
			}
			if ( $customer['default_source'] !== $token_data['card']['id'] ) {
				$stripe->customers->update(
					$customer['id'],
					[ 'source' => $token_data['id'] ]
				);
			}

			if ( 'once' === $frequency ) {
				// Create a Payment Intent on Stripe.
				$payment_data              = self::get_payment_data();
				$intent                    = $stripe->paymentIntents->create( // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
					[
						'amount'               => self::get_amount( $amount_raw, $payment_data['currency'] ),
						'currency'             => $payment_data['currency'],
						'receipt_email'        => $email_address,
						'customer'             => $customer['id'],
						'metadata'             => $payment_metadata,
						'description'          => __( 'Newspack One-Time Donation', 'newspack-blocks' ),
						'payment_method_types' => [ 'card' ],
					]
				);
				$response['client_secret'] = $intent['client_secret'];
			} else {
				// Create a Subscription on Stripe.
				$prices = \Newspack\Stripe_Connection::get_donation_prices();
				$price  = $prices[ $frequency ];
				$amount = self::get_amount( $amount_raw, $price['currency'] );

				$subscription = $stripe->subscriptions->create( // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
					[
						'customer'         => $customer['id'],
						'items'            => [
							[
								'price'    => $price['id'],
								'quantity' => $amount,
							],
						],
						'payment_behavior' => 'allow_incomplete',
						'metadata'         => $payment_metadata,
						'expand'           => [ 'latest_invoice.payment_intent' ],
					]
				);

				if ( 'incomplete' === $subscription->status ) {
					// The card may require additional authentication.
					$response['client_secret'] = $subscription->latest_invoice->payment_intent->client_secret;
				} elseif ( 'active' === $subscription->status ) {
					$response['status'] = 'success';
				}
			}
		} catch ( \Exception $e ) {
			$response['error'] = $e->getMessage();
		}

		return rest_ensure_response( $response );
	}

	/**
	 * Retrieve Stripe data saved in WC Stripe Gateway.
	 */
	public static function get_payment_data() {
		if ( ! Newspack_Blocks::can_use_streamlined_donate_block() ) {
			return [];
		}
		return \Newspack\Stripe_Connection::get_stripe_data();
	}
}
