/* globals jQuery, wc_checkout_params */
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
	$( document.body ).on( 'init_checkout', function () {
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

		function handleError( error_message ) {
			const $form = $( 'form.checkout' );
			$( '.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message' ).remove();
			$form.prepend(
				'<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout">' +
					error_message +
					'</div>'
			); // eslint-disable-line max-len
			$form.removeClass( 'processing' ).unblock();
			$form.find( '.input-text, select, input:checkbox' ).trigger( 'validate' ).trigger( 'blur' );
			// wc_checkout_form.scroll_to_notices();
			$( document.body ).trigger( 'checkout_error', [ error_message ] );
		}

		const $checkout_continue = $( '#checkout_continue' );
		const $customer_details = $( '#customer_details' );
		const $after_customer_details = $( '#after_customer_details' );
		const $form = $( 'form.checkout' );

		const submit = ev => {
			ev.preventDefault();
			$form.addClass( 'processing' ).block( {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6,
				},
			} );
			const serializedForm = $form.serializeArray();
			// Add parameter so it just performs validation.
			serializedForm.push( { name: 'woocommerce_checkout_update_totals', value: '1' } );
			// Ajax request.
			$.ajax( {
				type: 'POST',
				url: wc_checkout_params.checkout_url,
				data: serializedForm,
				dataType: 'html',
				success: response => {
					const result = JSON.parse( response );

					// Reload page
					if ( true === result.reload ) {
						window.location.reload();
						return;
					}

					$form.removeClass( 'processing' ).unblock();
					$( document.body ).trigger( 'update_checkout' );

					// Result will always be 'failure'. We'll check for 'messages' in the
					// response to see if it was successful.
					const success = ! result.messages;
					if ( success ) {
						$customer_details.hide();
						$after_customer_details.show();
						return;
					}

					// Add new errors
					if ( result.messages ) {
						handleError( result.messages );
					} else {
						handleError(
							'<div class="woocommerce-error">' + wc_checkout_params.i18n_checkout_error + '</div>'
						);
					}
				},
				error: ( jqXHR, textStatus, errorThrown ) => {
					handleError(
						'<div class="woocommerce-error">' +
							( errorThrown || wc_checkout_params.i18n_checkout_error ) +
							'</div>'
					);
				},
			} );
		};

		let editing = false;

		if ( $checkout_continue.length ) {
			editing = true;
			$customer_details.show();
			$after_customer_details.hide();
		}

		// Replace form submit handler.
		if ( editing ) {
			$form.off( 'submit' );
			$form.on( 'submit', submit );
		}
	} );
} )( jQuery );
