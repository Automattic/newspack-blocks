/* globals jQuery, wc_checkout_params */
/**
 * Style dependencies
 */
import './checkout.scss';

( function ( $ ) {
	if ( ! $ ) {
		return;
	}

	function getEventHandlers( element, event ) {
		const events = $._data( element, 'events' );
		if ( ! events ) {
			return [];
		}
		if ( ! event ) {
			return events;
		}
		return $._data( element, 'events' )[ event ];
	}

	function handleError( $form, error_message ) {
		// Clear previous errors.
		$( '.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message' ).remove();

		$form.removeClass( 'processing' ).unblock();
		$form.find( '.input-text, select, input:checkbox' ).trigger( 'validate' ).trigger( 'blur' );

		const $errors = $( error_message );
		let $erroredField = false;
		$errors.find( 'li' ).each( function () {
			const $error = $( this );
			const $field = $( '#' + $error.data( 'id' ) + '_field' );
			if ( $field?.length ) {
				if ( ! $erroredField ) {
					$erroredField = $field;
				}
				$field.addClass( 'woocommerce-invalid' ).removeClass( 'woocommerce-valid' );
				$field.append( '<span class="woocommerce-error">' + $error.html() + '</span>' );
				$error.remove();
			}
		} );
		if ( $errors.find( 'li' ).length ) {
			$form.prepend(
				$( '<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout"/>' ).append(
					$errors
				)
			);
			window.scroll( { top: 0, left: 0, behavior: 'smooth' } );
		} else if ( $erroredField?.length ) {
			window.scroll( { top: $erroredField.offset().top - 100, left: 0, behavior: 'smooth' } );
			$erroredField.find( 'input.input-text, select, input:checkbox' ).trigger( 'focus' );
		}
		$( document.body ).trigger( 'update_checkout' );
		$( document.body ).trigger( 'checkout_error', [ error_message ] );
	}

	function handleMethodSelected() {
		const selected = $( 'input[name="payment_method"]:checked' ).val();
		$( '.wc_payment_method' ).removeClass( 'selected' );
		$( '.wc_payment_method.payment_method_' + selected ).addClass( 'selected' );
	}

	$( document.body ).on( 'init_checkout', function () {
		const $form = $( 'form.checkout' );

		const $coupon = $( '.checkout_coupon' );
		const $checkout_continue = $( '#checkout_continue' );
		const $customer_details = $( '#customer_details' );
		const $after_customer_details = $( '#after_customer_details' );
		const $place_order_button = $( '#place_order' );

		handleMethodSelected();
		$( 'input[name="payment_method"]' ).change( handleMethodSelected );
		$( document ).on( 'payment_method_selected', handleMethodSelected );
		$( document ).on( 'updated_checkout', handleMethodSelected );

		$( document.body ).on( 'removed_coupon_in_checkout', function () {
			$coupon.show();
		} );
		$( document ).on( 'updated_checkout', function () {
			/**
			 * Toggle "Payment info" title if there's no money transaction.
			 */
			if ( $( '#payment .wc_payment_methods' ).length ) {
				$( '#after_customer_details > h3' ).show();
			} else {
				$( '#after_customer_details > h3' ).hide();
			}
		} );

		if ( $checkout_continue.length ) {
			setEditing( true );
			$form.on( 'click', '#checkout_back', function ( ev ) {
				ev.preventDefault();
				setEditing( true );
			} );
		}

		let editing = false;
		let originalFormHandlers;
		function setEditing( isEditing ) {
			editing = isEditing;
			// Scroll to top.
			window.scroll( { top: 0, left: 0, behavior: 'smooth' } );
			// Update checkout.
			$( document.body ).trigger( 'update_checkout' );
			// Clear errors.
			$( '.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message' ).remove();
			if ( editing ) {
				if ( $coupon.length ) {
					$coupon.hide();
				}
				$customer_details.show();
				$after_customer_details.hide();
				$place_order_button.attr( 'disabled', 'disabled' );
				originalFormHandlers = getEventHandlers( $form[ 0 ], 'submit' ).slice( 0 );
				originalFormHandlers.forEach( handler => {
					$form.off( 'submit', handler.handler );
				} );
				$form.on( 'submit', submit );
			} else {
				if ( $coupon.length ) {
					$coupon.show();
				}
				$customer_details.hide();
				$after_customer_details.show();
				$place_order_button.removeAttr( 'disabled' );
				// Re-add event handlers.
				$form.off( 'submit', submit );
				originalFormHandlers.forEach( handler => {
					$form.on( 'submit', handler.handler );
				} );
			}
		}

		function submit( ev ) {
			ev.preventDefault();
			if ( $form.is( '.processing' ) ) {
				return false;
			}
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

					// Result will always be 'failure' from the server. We'll check for
					// 'messages' in the response to see if it was successful.
					const success = ! result.messages;
					if ( success ) {
						setEditing( false );
						return;
					}

					// Add new errors
					if ( result.messages ) {
						handleError( $form, result.messages );
					} else {
						handleError(
							$form,
							'<div class="woocommerce-error">' + wc_checkout_params.i18n_checkout_error + '</div>'
						);
					}
				},
				error: ( jqXHR, textStatus, errorThrown ) => {
					handleError(
						$form,
						'<div class="woocommerce-error">' +
							( errorThrown || wc_checkout_params.i18n_checkout_error ) +
							'</div>'
					);
				},
			} );
		}
	} );
} )( jQuery );
