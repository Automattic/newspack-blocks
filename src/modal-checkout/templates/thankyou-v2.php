<?php
/**
 * Login form.
 *
 * @see https://docs.woocommerce.com/document/template-structure/
 * @package WooCommerce\Templates
 * @version 8.1.0
 *
 * @var WC_Order $order
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce by default doesn't allow order details to be shown
 * if the order is completed using a customer email address that doesn't match
 * the currently logged in user.
 *
 * Details: https://github.com/woocommerce/woocommerce/blob/trunk/plugins/woocommerce/includes/shortcodes/class-wc-shortcode-checkout.php#L302-L321
 *
 * For Newspack sites, we don't want to emphasize user account flows outside of
 * RAS. This custom login template replaces the login form that appears on the
 * order-received.php template with an order details summary so the experience
 * matches whether or not the email address used is already associated with an
 * existing customer account.
 */
function newspack_blocks_replace_login_with_order_summary() {
	$order    = isset( $_GET['order_id'] ) ? \wc_get_order( \absint( \wp_unslash( $_GET['order_id'] ) ) ) : false; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$key      = isset( $_GET['key'] ) ? \wc_clean( \sanitize_text_field( \wp_unslash( $_GET['key'] ) ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$is_valid = $order && is_a( $order, 'WC_Order' ) && hash_equals( $order->get_order_key(), $key ); // Validate order key to prevent CSRF.

	// Handle the newsletter signup form.
	$newsletter_confirmation = \Newspack_Blocks\Modal_Checkout::confirm_newsletter_signup();
	$is_error                = \is_wp_error( $newsletter_confirmation );
	$no_selected_lists       = $is_error && 'newspack_no_lists_selected' === $newsletter_confirmation->get_error_code();
	if ( true === $newsletter_confirmation || $no_selected_lists ) {
		echo \Newspack_Blocks\Modal_Checkout::render_newsletter_confirmation( $no_selected_lists ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		return;
	} elseif ( $is_error ) {
		echo esc_html( $newsletter_confirmation->get_error_message() );
		return;
	}

	if ( ! $is_valid ) {
		return;
	}

	$is_success = ! $order->has_status( 'failed' );
	?>

	<?php if ( $is_success ) : ?>
		<div class="newspack-ui__box newspack-ui__box--success newspack-ui__box__text-center">
			<p>
				<strong>
					<?php
						esc_html_e(
							'Thank you for supporting The News Paper! Your transaction was successful.',
							'newspack-blocks'
						);
					?>
				</strong>
			</p>
		</div>
		<?php echo \Newspack_Blocks\Modal_Checkout::render_checkout_after_success_markup( $order ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php else : ?>
		<div class="newspack-ui__box newspack-ui__box__error newspack-ui__box__text-center">
			<p>
				<?php esc_html_e( 'Unfortunately your order cannot be processed. Please attempt your purchase again.', 'newspack-blocks' ); ?>
			</p>
		</div>
		<a href="<?php echo esc_url( $order->get_checkout_payment_url() ); ?>" class="newspack-blocks-ui__button newspack-ui__button--primary newspack-ui__button--wide"><?php esc_html_e( 'Pay', 'newspack-blocks' ); ?></a>
		<?php if ( is_user_logged_in() ) : ?>
			<a href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>" class="newspack-blocks-ui__button newspack-ui__button--tertiary newspack-ui__button--wide"><?php esc_html_e( 'My account', 'newspack-blocks' ); ?></a>
		<?php endif; ?>
		<?php
	endif;
}

newspack_blocks_replace_login_with_order_summary();
