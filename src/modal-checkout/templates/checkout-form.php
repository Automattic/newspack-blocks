<?php
/**
 * Checkout Form
 *
 * @see https://woo.com/document/template-structure/
 * @package Newspack_Blocks
 */

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- WooCommerce hooks.
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- Template variables.

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

do_action( 'woocommerce_before_checkout_form', $checkout );

// If checkout registration is disabled and not logged in, the user cannot checkout.
if ( ! $checkout->is_registration_enabled() && $checkout->is_registration_required() && ! is_user_logged_in() ) {
	echo esc_html( apply_filters( 'woocommerce_checkout_must_be_logged_in_message', __( 'You must be logged in to checkout.', 'newspack-blocks' ) ) );
	return;
}

?>

<form name="checkout" method="post" class="checkout woocommerce-checkout" action="<?php echo esc_url( wc_get_checkout_url() ); ?>" enctype="multipart/form-data">
	<?php if ( $checkout->get_checkout_fields() ) : ?>

		<?php do_action( 'woocommerce_checkout_before_customer_details' ); ?>

		<div id="customer_details">
			<?php do_action( 'woocommerce_checkout_billing' ); ?>
			<?php do_action( 'woocommerce_checkout_shipping' ); ?>
			<input type="submit" id="continue_order" class="button" value="<?php esc_attr_e( 'Continue', 'newspack-blocks' ); ?>" />
		</div>

		<div id="after_customer_details">
			<?php do_action( 'woocommerce_checkout_after_customer_details' ); ?>
			<input type="submit" id="edit_details" class="button" value="<?php esc_attr_e( 'Go back', 'newspack-blocks' ); ?>" />
		</div>

	<?php endif; ?>

</form>

<?php do_action( 'woocommerce_after_checkout_form', $checkout ); ?>
