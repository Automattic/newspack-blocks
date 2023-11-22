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
		showCouponForm();
	};
	const showCouponForm = () => {
		$( '.checkout_coupon' ).show();
	};
	$( document ).ready( function () {
		$( document ).on( 'payment_method_selected', handleMethodSelected );
		$( document ).on( 'updated_checkout', handleMethodSelected );
		$( 'input[name="payment_method"]' ).change( handleMethodSelected );
		handleMethodSelected();
	} );
} )( jQuery );
