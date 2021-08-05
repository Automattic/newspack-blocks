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
		$payment_data  = self::get_payment_data();
		$error         = null;
		$client_secret = null;

		try {
			$stripe = \Newspack\Stripe_Connection::get_stripe_client();

			$token_data         = $request->get_param( 'tokenData' );
			$amount             = self::get_amount( $request->get_param( 'amount' ), $payment_data['currency'] );
			$email_address      = $request->get_param( 'email' );
			$frequency          = $request->get_param( 'frequency' );
			$metadata_frequency = 'once' === $frequency ? 'One-Time' : ( 'month' === $frequency ? 'Monthly' : 'Yearly' );

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

			$payment_metadata = [
				'Source'          => 'Newspack',
				'Property'        => '',
				'Type'            => 'once' === $frequency ? 'Single' : 'Recurring',
				'Frequency'       => $metadata_frequency,
				'Email'           => $email_address,
				'DonationAmount'  => $amount,
				'AgreedToPayFees' => 'No',
				'clientId'        => $request->get_param( 'clientId' ),
			];

			$intent        = $stripe->paymentIntents->create( // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				[
					'amount'               => $amount,
					'currency'             => $payment_data['currency'],
					'receipt_email'        => $email_address,
					'customer'             => $customer['id'],
					'metadata'             => $payment_metadata,
					'payment_method_types' => [ 'card' ],
				]
			);
			$client_secret = $intent['client_secret'];
		} catch ( \Exception $e ) {
			$error = $e->getMessage();
		}

		$response = [
			'error'         => $error,
			'client_secret' => $client_secret,
		];
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
