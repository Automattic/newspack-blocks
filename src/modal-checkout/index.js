/* globals jQuery */
/**
 * Style dependencies
 */
import './checkout.scss';

( function ( $ ) {
	if ( ! $ ) {
		return;
	}
	const handleMethodSelected = () => {
		const selected = $( 'input[name="payment_method"]:checked' ).val();
		$( '.wc_payment_method' ).removeClass( 'selected' );
		$( '.wc_payment_method.payment_method_' + selected ).addClass( 'selected' );
	};
	$( document ).ready( function () {
		handleMethodSelected();
		$( 'input[name="payment_method"]' ).change( handleMethodSelected );
		$( document ).on( 'payment_method_selected', handleMethodSelected );
		$( document ).on( 'updated_checkout', handleMethodSelected );
		$( document ).on( 'updated_checkout', function () {
			// Always show coupon form.
			if ( $( '.checkout_coupon' ).length ) {
				$( '.checkout_coupon' ).show();
			}
			/**
			 * Toggle "Payment info" title if there's no money transaction.
			 */
			if ( $( '#payment .wc_payment_methods' ).length ) {
				$( '#after_customer_details > h3' ).show();
			} else {
				$( '#after_customer_details > h3' ).hide();
			}
		} );
	} );
} )( jQuery );
