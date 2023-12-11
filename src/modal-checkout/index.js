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

	function clearNotices() {
		$(
			'.woocommerce-NoticeGroup-checkout, .woocommerce-error, .woocommerce-message, .wc-block-components-notice-banner'
		).remove();
	}

	$( document.body ).on( 'init_checkout', function () {
		let editing = false;
		let originalFormHandlers = [];

		const $form = $( 'form.checkout' );

		const $coupon = $( 'form.checkout_coupon' );
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
			clearNotices();
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
			clearNotices();

			$form.removeClass( 'processing' ).unblock();
			$form.find( '.input-text, select, input:checkbox' ).trigger( 'validate' ).trigger( 'blur' );

			let $fieldToFocus = false;

			const genericErrors = [];

			const handleErrorItem = $error => {
				const $field = $( '#' + $error.data( 'id' ) + '_field' );
				if ( $field?.length ) {
					if ( ! $fieldToFocus ) {
						$fieldToFocus = $field;
					}
					$field.addClass( 'woocommerce-invalid' ).removeClass( 'woocommerce-valid' );
					$field.append( '<span class="woocommerce-error">' + $error.text() + '</span>' );
					$error.remove();
				} else {
					if ( ! $error.is( 'li' ) ) {
						$error = $( '<li />' ).append( $error );
					}
					genericErrors.push( $error );
				}
			};

			/**
			 * The new "wc-block-components-notice-banner" does not provide a <li />
			 * of errors when only one field failed validation.
			 */
			if ( ! error_message.includes( '<li' ) ) {
				handleErrorItem( $( error_message ) );
			} else {
				const $errors = $( error_message );
				$errors.find( 'li' ).each( function () {
					handleErrorItem( $( this ) );
				} );
			}

			// Handle generic errors.
			if ( genericErrors.length ) {
				$fieldToFocus = false; // Don't focus a field if validation returned generic errors.
				$form.prepend(
					$( '<div class="woocommerce-NoticeGroup woocommerce-NoticeGroup-checkout"/>' ).append(
						$( '<ul class="woocommerce-error" role="alert" />' ).append( genericErrors )
					)
				);
				window.scroll( { top: 0, left: 0, behavior: 'smooth' } );
			}

			if ( $fieldToFocus?.length ) {
				window.scroll( { top: $fieldToFocus.offset().top - 100, left: 0, behavior: 'smooth' } );
				$fieldToFocus.find( 'input.input-text, select, input:checkbox' ).trigger( 'focus' );
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
			clearNotices();
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
			let billingAddress = '';
			if ( data.billing_address_1 || data.billing_address_2 ) {
				billingAddress = '<p>';
				if ( data.billing_address_1 ) {
					billingAddress += data.billing_address_1;
				}
				if ( data.billing_address_2 ) {
					billingAddress += ' ' + data.billing_address_2;
				}
				billingAddress += '<br>';
				if ( data.billing_city ) {
					billingAddress += data.billing_city;
				}
				if ( data.billing_state ) {
					billingAddress += ', ' + data.billing_state;
				}
				if ( data.billing_postcode ) {
					billingAddress += ' ' + data.billing_postcode;
				}
				billingAddress += '<br>';
				if ( data.billing_country ) {
					billingAddress += data.billing_country;
				}
			}
			html.push( billingAddress );
			if ( data.billing_email ) {
				html.push( '<p>' + data.billing_email + '</p>' );
			}
			html.push( '</div>' ); // Close billing-details.

			// Shipping details.
			if ( data.hasOwnProperty( 'shipping_address_1' ) ) {
				html.push( '<div class="shipping-details">' );
				html.push( '<h3>' + newspackBlocksModalCheckout.labels.shipping_details + '</h3>' );
				let shippingAddress = '';
				if ( ! data.ship_to_different_address ) {
					shippingAddress = billingAddress;
				} else {
					shippingAddress = '<p>';
					if ( data.shipping_address_1 ) {
						shippingAddress += data.shipping_address_1;
					}
					if ( data.shipping_address_2 ) {
						shippingAddress += ' ' + data.shipping_address_2;
					}
					shippingAddress += '<br>';
					if ( data.shipping_city ) {
						shippingAddress += data.shipping_city;
					}
					if ( data.shipping_state ) {
						shippingAddress += ', ' + data.shipping_state;
					}
					if ( data.shipping_postcode ) {
						shippingAddress += ' ' + data.shipping_postcode;
					}
					shippingAddress += '<br>';
					if ( data.shipping_country ) {
						shippingAddress += data.shipping_country;
					}
				}
				html.push( shippingAddress );
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
			// Add 'update totals' parameter so it just performs validation.
			serializedForm.push( { name: 'woocommerce_checkout_update_totals', value: '1' } );
			// Ajax request.
			$.ajax( {
				type: 'POST',
				url: wc_checkout_params.checkout_url,
				data: serializedForm,
				dataType: 'html',
				success: response => {
					let result;
					try {
						result = JSON.parse( response );
					} catch ( e ) {
						result = {
							messages:
								'<div class="woocommerce-error">' +
								wc_checkout_params.i18n_checkout_error +
								'</div>',
						};
					}

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
