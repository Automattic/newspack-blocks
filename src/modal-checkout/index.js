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
	const hideCouponForm = () => {
		$( '.checkout_coupon' ).hide();
	};
	const scrollTop = () => {
		$( 'html, body' ).animate(
			{
				scrollTop: 0,
			},
			300
		);
	};
	const editDetails = () => {
		scrollTop();
		$( '#customer_details' ).show();
		$( '#after_customer_details' ).hide();
		hideCouponForm();
	};
	const proceedToPay = () => {
		scrollTop();
		$( '#customer_details' ).hide();
		$( '#after_customer_details' ).show();
		showCouponForm();
	};
	$( document ).ready( function () {
		$( document ).on( 'payment_method_selected', handleMethodSelected );
		$( document ).on( 'updated_checkout', handleMethodSelected );
		$( 'input[name="payment_method"]' ).change( handleMethodSelected );
		handleMethodSelected();

		/**
		 * If we have a continue order button, treat as a 2-step checkout.
		 */
		if ( $( '#continue_order' ).length ) {
			$( '#continue_order' ).click( ev => {
				ev.preventDefault();
				proceedToPay();
			} );
			$( '#edit_details' ).click( ev => {
				ev.preventDefault();
				editDetails();
			} );
			editDetails();
		}
	} );
} )( jQuery );
