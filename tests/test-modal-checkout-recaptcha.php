<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Class ModalCheckoutRecaptchaTest
 *
 * @package Newspack_Blocks
 */

use Newspack_Blocks\Modal_Checkout;

/**
 * Modal_Checkout::recaptcha_verify_captcha scoping invariant.
 *
 * Locks the gating rules so future edits can't silently widen the bypass:
 *   - non-checkout context             → unchanged
 *   - non-modal request                → unchanged
 *   - modal + logged-out               → unchanged (auth gate)
 *   - modal + logged-in + validation   → false
 *   - modal + logged-in + cheque/bacs/cod → false
 *   - modal + logged-in + other gateway → unchanged
 *
 * @group modal-checkout
 */
class ModalCheckoutRecaptchaTest extends WP_UnitTestCase { // phpcs:ignore

	/**
	 * URL passed to the filter — not consulted by the callback, present for signature parity.
	 */
	const DUMMY_URL = 'https://example.test/checkout/';

	/**
	 * Reset superglobals and current user between cases.
	 */
	public function tear_down() {
		unset( $_REQUEST['modal_checkout'], $_REQUEST['post_data'] );
		unset( $_POST['payment_method'], $_POST['is_validation_only'] );
		wp_set_current_user( 0 );
		parent::tear_down();
	}

	/**
	 * Mark the request as a modal-checkout request and authenticate a reader.
	 *
	 * @param string $payment_method Payment method to put on $_POST. Empty to leave unset.
	 */
	private function set_up_authed_modal_request( $payment_method = '' ) {
		$_REQUEST['modal_checkout'] = '1';
		if ( '' !== $payment_method ) {
			$_POST['payment_method'] = $payment_method;
		}
		$user_id = self::factory()->user->create();
		wp_set_current_user( $user_id );
	}

	/**
	 * Non-checkout contexts must pass through unchanged.
	 */
	public function test_non_checkout_context_passes_through() {
		$_REQUEST['modal_checkout'] = '1';
		$_POST['payment_method']    = 'cheque';

		$this->assertTrue( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'login' ) );
		$this->assertFalse( Modal_Checkout::recaptcha_verify_captcha( false, self::DUMMY_URL, 'login' ) );
	}

	/**
	 * A crafted POST to standard /checkout/ (no modal_checkout flag) must not
	 * be able to disable reCAPTCHA via either bypass path.
	 */
	public function test_non_modal_request_is_not_bypassed() {
		$_POST['payment_method']    = 'cheque';
		$_POST['is_validation_only'] = '1';

		$this->assertTrue( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ) );
	}

	/**
	 * Unauthenticated modal requests must not be able to bypass reCAPTCHA —
	 * this is the abuse-vector gate that prevents spamming reader/order
	 * records via crafted POSTs with modal_checkout=1.
	 */
	public function test_unauthenticated_modal_request_is_not_bypassed() {
		$_REQUEST['modal_checkout']  = '1';
		$_POST['payment_method']     = 'cheque';
		$_POST['is_validation_only'] = '1';

		$this->assertTrue( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ) );
	}

	/**
	 * Authenticated modal + validation-only request bypasses reCAPTCHA. This
	 * is the validation step from the first modal screen, which must not
	 * consume the v2 widget.
	 */
	public function test_modal_validation_only_bypasses() {
		$this->set_up_authed_modal_request();
		$_POST['is_validation_only'] = '1';

		$this->assertFalse( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ) );
	}

	/**
	 * Each offline gateway in the bypass allowlist must bypass reCAPTCHA when
	 * a reader is authenticated inside the modal.
	 *
	 * @dataProvider provider_bypass_gateways
	 *
	 * @param string $gateway Gateway ID.
	 */
	public function test_modal_bypass_gateway_bypasses( $gateway ) {
		$this->set_up_authed_modal_request( $gateway );

		$this->assertFalse(
			Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ),
			"Gateway '$gateway' should bypass reCAPTCHA inside the modal."
		);
	}

	/**
	 * Default bypass gateways.
	 *
	 * @return array<int, array{0: string}>
	 */
	public function provider_bypass_gateways() {
		return [
			[ 'cheque' ],
			[ 'bacs' ],
			[ 'cod' ],
		];
	}

	/**
	 * A non-bypass gateway must still require reCAPTCHA verification.
	 */
	public function test_modal_non_bypass_gateway_still_verifies() {
		$this->set_up_authed_modal_request( 'stripe' );

		$this->assertTrue( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ) );
	}

	/**
	 * Authenticated modal request with no validation_only and no
	 * payment_method passes through to the caller's default.
	 */
	public function test_modal_with_no_bypass_signals_passes_through() {
		$this->set_up_authed_modal_request();

		$this->assertTrue( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ) );
		$this->assertFalse( Modal_Checkout::recaptcha_verify_captcha( false, self::DUMMY_URL, 'checkout' ) );
	}

	/**
	 * The bypass gateway list is filterable so publishers can add/remove
	 * offline gateways without touching plugin code.
	 */
	public function test_bypass_gateway_filter_is_respected() {
		$filter = function ( $gateways ) {
			$gateways[] = 'custom_offline';
			return $gateways;
		};
		add_filter( 'newspack_blocks_modal_checkout_recaptcha_bypass_gateways', $filter );

		$this->set_up_authed_modal_request( 'custom_offline' );

		$this->assertFalse( Modal_Checkout::recaptcha_verify_captcha( true, self::DUMMY_URL, 'checkout' ) );

		remove_filter( 'newspack_blocks_modal_checkout_recaptcha_bypass_gateways', $filter );
	}
}
