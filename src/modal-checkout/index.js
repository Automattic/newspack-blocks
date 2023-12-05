/* globals newspackBlocksModalCheckout, jQuery, wc_checkout_params */
/**
 * Style dependencies
 */
import './checkout.scss';

( function ( $ ) {
	if ( ! $ ) {
		return;
	}

	const readyEvent = new CustomEvent( 'checkout-ready' );

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

	$( document.body ).on( 'init_checkout', function () {
		let editing = false;
		let originalFormHandlers = [];

		const $form = $( 'form.checkout' );

		const $coupon = $( '.checkout_coupon' );
		const $checkout_continue = $( '#checkout_continue' );
		const $customer_details = $( '#customer_details' );
		const $after_customer_details = $( '#after_customer_details' );
		const $place_order_button = $( '#place_order' );

		/**
		 * Handle styling update for selected payment method.
		 */
		handlePaymentMethodSelect();
		$( 'input[name="payment_method"]' ).change( handlePaymentMethodSelect );
		$( document ).on( 'payment_method_selected', handlePaymentMethodSelect );
		$( document ).on( 'updated_checkout', handlePaymentMethodSelect );

		/**
		 * Ensure coupon form is shown after removing a coupon.
		 */
		$( document.body ).on( 'removed_coupon_in_checkout', function () {
			$coupon.show();
		} );

		/**
		 * Toggle "Payment info" title if there's no money transaction.
		 */
		$( document ).on( 'updated_checkout', function () {
			if ( $( '#payment .wc_payment_methods' ).length ) {
				$( '#after_customer_details > h3' ).show();
			} else {
				$( '#after_customer_details > h3' ).hide();
			}
		} );

		if ( $checkout_continue.length ) {
			setEditing( true );
			validateForm( true, () => {
				// Attach handler to "Back" button.
				$form.on( 'click', '#checkout_back', function ( ev ) {
					ev.preventDefault();
					setEditing( true );
				} );
				setReady();
			} );
		} else {
			setReady();
		}

		function handleFormError( error_message ) {
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

		/**
		 * Set the checkout as ready so the modal can resolve the loading state.
		 */
		function setReady() {
			const container = document.querySelector( '#newspack_modal_checkout' );
			container.checkoutReady = true;
			container.dispatchEvent( readyEvent );
		}

		function handlePaymentMethodSelect() {
			const selected = $( 'input[name="payment_method"]:checked' ).val();
			$( '.wc_payment_method' ).removeClass( 'selected' );
			$( '.wc_payment_method.payment_method_' + selected ).addClass( 'selected' );
		}

		function handleFormSubmit( ev ) {
			ev.preventDefault();
			validateForm();
		}

		function setEditing( isEditing ) {
			editing = isEditing;
			// Scroll to top.
			window.scroll( { top: 0, left: 0, behavior: 'smooth' } );
			// Update checkout.
			$( document.body ).trigger( 'update_checkout' );
			// Clear errors.
			$( '.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message' ).remove();
			// Clear checkout details.
			$( '#checkout_details' ).remove();
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
				$form.on( 'submit', handleFormSubmit );
			} else {
				if ( $coupon.length ) {
					$coupon.show();
				}
				$customer_details.hide();
				$after_customer_details.show();
				$place_order_button.removeAttr( 'disabled' );
				buildCheckoutDetails();
				// Re-add event handlers.
				$form.off( 'submit', handleFormSubmit );
				originalFormHandlers.forEach( handler => {
					$form.on( 'submit', handler.handler );
				} );
			}
		}

		function buildCheckoutDetails() {
			$( '#checkout_details' ).remove();
			const data = {};
			$form.serializeArray().forEach( item => {
				data[ item.name ] = item.value;
			} );

			const html = [];
			html.push( '<div class="billing-details">' );
			html.push( '<h3>' + newspackBlocksModalCheckout.labels.billing_details + '</h3>' );
			if ( data.billing_first_name || data.billing_last_name ) {
				html.push( '<p>' + data.billing_first_name + ' ' + data.billing_last_name + '</p>' );
			}
			if ( data.billing_company ) {
				html.push( '<p>' + data.billing_company + '</p>' );
			}
			if ( data.billing_address_1 || data.billing_address_2 ) {
				html.push(
					'<p>' +
						data.billing_address_1 +
						' ' +
						data.billing_address_2 +
						'<br>' +
						data.billing_city +
						', ' +
						data.billing_state +
						' ' +
						data.billing_postcode +
						'<br>' +
						data.billing_country +
						'</p>'
				);
			}
			if ( data.billing_email ) {
				html.push( '<p>' + data.billing_email + '</p>' );
			}
			html.push( '</div>' ); // Close billing-details.

			if ( data.shipping_address_1 || data.shipping_address_2 ) {
				html.push( '<div class="shipping-details">' );
				html.push( '<h3>' + newspackBlocksModalCheckout.labels.shipping_details + '</h3>' );
				html.push(
					'<p>' +
						data.shipping_address_1 +
						' ' +
						data.shipping_address_2 +
						'<br>' +
						data.shipping_city +
						', ' +
						data.shipping_state +
						' ' +
						data.shipping_postcode +
						'<br>' +
						data.shipping_country +
						'</p>'
				);
				html.push( '</div>' ); // Close shipping-details.
			}
			$( '.order-details-summary' ).after(
				'<div id="checkout_details">' + html.join( '' ) + '</div>'
			);
		}

		function validateForm( silent = false, cb = () => {} ) {
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
					if ( ! silent && true === result.reload ) {
						window.location.reload();
						return;
					}

					// Unblock form.
					$form.removeClass( 'processing' ).unblock();

					// Result will always be 'failure' from the server. We'll check for
					// 'messages' in the response to see if it was successful.
					const success = ! result.messages;
					if ( success ) {
						setEditing( false );
					} else if ( ! silent ) {
						if ( result.messages ) {
							handleFormError( result.messages );
						} else {
							handleFormError(
								'<div class="woocommerce-error">' +
									wc_checkout_params.i18n_checkout_error +
									'</div>'
							);
						}
					}
					cb( result );
				},
				error: ( jqXHR, textStatus, errorThrown ) => {
					let messages = '';
					if ( ! silent ) {
						messages =
							'<div class="woocommerce-error">' +
							( errorThrown || wc_checkout_params.i18n_checkout_error ) +
							'</div>';
						handleFormError( messages );
					}
					cb( { messages } );
				},
			} );
		}
	} );
} )( jQuery );
