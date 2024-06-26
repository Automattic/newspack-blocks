/* globals newspackBlocksModalCheckout, jQuery, wc_checkout_params */
/**
 * Style dependencies
 */
import './checkout.scss';

/**
 * Internal dependencies
 */
import { domReady } from './utils';

domReady(
	( $ => {
		if ( ! $ ) {
			return;
		}

		const readyEvent = new CustomEvent( 'checkout-ready' );
		const completeEvent = new CustomEvent( 'checkout-complete' );

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
				`.woocommerce-NoticeGroup-checkout, .${ newspackBlocksModalCheckout.newspack_class_prefix }__inline-error, .woocommerce-error, .woocommerce-message, .wc-block-components-notice-banner`
			).remove();
		}

		if ( newspackBlocksModalCheckout.is_checkout_complete ) {
			/**
			 * Set the checkout as complete so the modal can resolve post checkout state.
			 */
			function setComplete() {
				container.checkoutComplete = true;
				container.dispatchEvent( completeEvent );
			}

			/**
			 * Set the checkout as complete so the modal can resolve post checkout flows.
			 */
			const container = document.querySelector( '#newspack_modal_checkout_container' );
			if ( container ) {
				setComplete();
			}
		} else {
			$( document.body ).on( 'init_checkout', function () {
				let originalFormHandlers = [];

				const $form = $( 'form.checkout' );

				if ( ! $form.length ) {
					return;
				}
				const $coupon = $( 'form.modal_checkout_coupon' );
				const $nyp = $( 'form.modal_checkout_nyp' );
				const $checkout_continue = $( '#checkout_continue' );
				const $customer_details = $( '#customer_details' );
				const $after_customer_details = $( '#after_customer_details' );
				const $place_order_button = $( '#place_order' );
				const $gift_options = $( '.newspack-wcsg--wrapper' );

				/**
				 * Handle styling update for selected payment method.
				 */
				function handlePaymentMethodSelect() {
					const selected = $( 'input[name="payment_method"]:checked' ).val();
					$( '.wc_payment_method' ).removeClass( 'selected' );
					$( '.wc_payment_method.payment_method_' + selected ).addClass( 'selected' );
				}
				$( 'input[name="payment_method"]' ).change( handlePaymentMethodSelect );
				$( document ).on( 'payment_method_selected', handlePaymentMethodSelect );
				$( document ).on( 'updated_checkout', handlePaymentMethodSelect );
				handlePaymentMethodSelect();

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

				/**
				 * Handle order review table appearance.
				 */
				$( document ).on( 'updated_checkout', function () {
					const $wrapper = $( '#after_customer_details > .order-review-wrapper' );
					if ( ! $wrapper.length ) {
						return;
					}
					const $el = $wrapper.clone();
					// Remove existing table from inside the payment methods.
					$( '#payment .order-review-wrapper' ).remove();
					// Move new order review table to the payment methods.
					$( '.payment_methods' ).after( $el );
					// Toggle visibility according to table content.
					const $table = $el.find( 'table' );
					if ( $table.is( '.empty' ) ) {
						$el.addClass( 'hidden' );
					} else {
						$el.removeClass( 'hidden' );
					}
				} );

				/**
				 * Handle gift options.
				 */
				if ( $gift_options.length ) {
					const $gift_toggle = $gift_options.find( '.newspack-wcsg--gift-toggle input' );
					const $gift_email = $gift_options.find( '.newspack-wcsg--gift-email' );
					$gift_toggle.on( 'change', function () {
						if ( $gift_toggle.is( ':checked' ) ) {
							$gift_email.addClass( 'visible' );
						} else {
							$gift_email.removeClass( 'visible' );
						}
					} );
				}

				/**
				 * Initialize the 2-step checkout form.
				 */
				if ( $checkout_continue.length ) {
					setEditingDetails( true );
					// Perform initial validation so it can skip 1st step if possible.
					validateForm( true, () => {
						// Attach handler to "Back" button.
						$form.on( 'click', '#checkout_back', function ( ev ) {
							ev.preventDefault();
							setEditingDetails( true );
						} );
						setReady();
					} );
				} else {
					setReady();
				}

				/**
				 * Handle form errors while editing billing/shipping fields.
				 *
				 * @param {string} error_message
				 */
				function handleFormError( error_message ) {
					$form.removeClass( 'processing' ).unblock();
					$form
						.find( '.input-text, select, input:checkbox' )
						.trigger( 'validate' )
						.trigger( 'blur' );

					let $fieldToFocus = false;

					const genericErrors = [];

					/**
					 * If a field is found, append the error to it. Otherwise, add it to the
					 * generic errors array.
					 *
					 * @param {jQuery} $error
					 */
					const handleErrorItem = $error => {
						// Add errors to known fields.
						const $field = $( '#' + $error.data( 'id' ) + '_field' );
						if ( $field?.length ) {
							if ( ! $fieldToFocus ) {
								$fieldToFocus = $field;
							}
							const $existingError = $field.find( '.woocommerce-error' );
							if ( $existingError.length ) {
								$existingError.remove();
							}
							$field.addClass( 'woocommerce-invalid' ).removeClass( 'woocommerce-valid' );
							$field.append(
								`<span class="${ newspackBlocksModalCheckout.newspack_class_prefix }__inline-error">` +
									$error.text() +
									'</span>'
							);
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
					const container = document.querySelector( '#newspack_modal_checkout_container' );
					container.checkoutReady = true;
					container.dispatchEvent( readyEvent );
				}

				/**
				 * Handle coupon form submit.
				 *
				 * @param {Event} ev
				 */
				function handleCouponSubmit( ev ) {
					ev.preventDefault();
					if ( $coupon.is( '.processing' ) ) {
						return false;
					}
					$coupon.addClass( 'processing' ).block( {
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity: 0.6,
						},
					} );
					const data = {
						security: wc_checkout_params.apply_coupon_nonce,
						coupon_code: $coupon.find( 'input[name="coupon_code"]' ).val(),
					};
					// Ajax request.
					$.ajax( {
						type: 'POST',
						url: wc_checkout_params.wc_ajax_url
							.toString()
							.replace( '%%endpoint%%', 'apply_coupon' ),
						data,
						dataType: 'html',
						success: code => {
							clearNotices();
							$coupon.find( '.result' ).remove();
							if ( code ) {
								const isError = code.includes( 'error' );
								$coupon.append(
									`<p class="result ${ newspackBlocksModalCheckout.newspack_class_prefix }__helper-text">` +
										$( code ).text() +
										'</p>'
								);
								if ( isError ) {
									$coupon.find( 'input[name="coupon_code"]' ).focus();
								}
								$( document.body ).trigger( 'applied_coupon_in_checkout', [ data.coupon_code ] );
								$( document.body ).trigger( 'update_checkout', { update_shipping_method: false } );
							}
						},
						complete: () => {
							// Unblock form.
							$coupon.removeClass( 'processing' ).unblock();
						},
					} );
				}
				if ( $coupon.length ) {
					$coupon.on( 'submit', handleCouponSubmit );
					$( document.body ).on( 'removed_coupon_in_checkout', () => {
						clearNotices();
						$coupon.find( '.result' ).remove();
						$coupon.find( 'input[name="coupon_code"]' ).val( '' ).focus();
					} );
				}

				/**
				 * Handle name your price submission.
				 *
				 * @param {Event} ev
				 */
				function handleNYPFormSubmit( ev ) {
					ev.preventDefault();
					if ( $nyp.is( '.processing' ) ) {
						return false;
					}
					$nyp.addClass( 'processing' );
					const input = $nyp.find( 'input[name="price"]' );
					input.attr( 'disabled', true );
					const data = {
						_ajax_nonce: newspackBlocksModalCheckout.nyp_nonce,
						action: 'process_name_your_price_request',
						price: $nyp.find( 'input[name="price"]' ).val(),
						product_id: $nyp.find( 'input[name="product_id"]' ).val(),
						newspack_checkout_name_your_price: $nyp
							.find( 'input[name="newspack_checkout_name_your_price"]' )
							.val(),
					};
					$.ajax( {
						type: 'POST',
						url: newspackBlocksModalCheckout.ajax_url,
						data,
						success: ( { success, data: res } ) => {
							clearNotices();
							$nyp.find( '.result' ).remove();
							$nyp.append(
								`<p class="result ${ newspackBlocksModalCheckout.newspack_class_prefix }__${
									success ? 'helper-text' : 'inline-error'
								}">` +
									res.message +
									'</p>'
							);
							if ( success ) {
								$( '.woocommerce-Price-amount' ).replaceWith( res.price );
							} else {
								$nyp.find( 'input[name="price"]' ).focus();
							}
							$( document.body ).trigger( 'update_checkout' );
						},
						complete: () => {
							input.attr( 'disabled', false );
							input.focus();
							$nyp.removeClass( 'processing' );
						},
					} );
				}
				if ( $nyp.length ) {
					$nyp.on( 'submit', handleNYPFormSubmit );
				}

				/**
				 * Handle form 1st step submission.
				 *
				 * @param {Event} ev
				 */
				function handleFormSubmit( ev ) {
					ev.preventDefault();
					validateForm();
				}

				/**
				 * Set the checkout state as editing billing/shipping fields or not.
				 *
				 * @param {boolean} isEditingDetails
				 */
				function setEditingDetails( isEditingDetails ) {
					// Scroll to top.
					window.scroll( { top: 0, left: 0, behavior: 'smooth' } );
					// Update checkout.
					$( document.body ).trigger( 'update_checkout' );
					clearNotices();
					// Clear checkout details.
					$( '#checkout_details' ).remove();
					if ( isEditingDetails ) {
						if ( $coupon.length ) {
							$coupon.hide();
						}
						if ( $nyp.length ) {
							$nyp.hide();
						}
						$customer_details.show();
						$after_customer_details.hide();
						$place_order_button.attr( 'disabled', 'disabled' );
						$customer_details.find( 'input' ).first().focus();
						// Remove default form event handlers.
						originalFormHandlers = getEventHandlers( $form[ 0 ], 'submit' ).slice( 0 );
						originalFormHandlers.forEach( handler => {
							$form.off( 'submit', handler.handler );
						} );
						$form.on( 'submit', handleFormSubmit );
					} else {
						if ( $coupon.length ) {
							$coupon.show();
						}
						if ( $nyp.length ) {
							$nyp.show();
						}
						$customer_details.hide();
						$after_customer_details.show();
						$place_order_button.removeAttr( 'disabled' );
						renderCheckoutDetails();
						// Store event handlers.
						$form.off( 'submit', handleFormSubmit );
						originalFormHandlers.forEach( handler => {
							$form.on( 'submit', handler.handler );
						} );
					}
					$form.triggerHandler( 'editing_details', [ isEditingDetails ] );
				}

				/**
				 * Render the checkout billing/shipping details summary HTML.
				 */
				function renderCheckoutDetails() {
					$( '#checkout_details' ).remove();
					const data = {};
					$form.serializeArray().forEach( item => {
						data[ item.name ] = item.value;
					} );

					const classname = `${ newspackBlocksModalCheckout.newspack_class_prefix }__font--xs`;
					const html = [];
					html.push( '<div class="billing-details">' );
					html.push( '<h3>' + newspackBlocksModalCheckout.labels.billing_details + '</h3>' );
					if ( data.billing_first_name || data.billing_last_name ) {
						html.push(
							`<p class="${ classname }">` +
								data.billing_first_name +
								' ' +
								data.billing_last_name +
								'</p>'
						);
					}
					if ( data.billing_company ) {
						html.push( `<p class="${ classname }">` + data.billing_company + '</p>' );
					}
					let billingAddress = '';
					if ( data.billing_address_1 || data.billing_address_2 ) {
						billingAddress = `<p class="${ classname }">`;
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
						html.push( `<p class="${ classname }">` + data.billing_email + '</p>' );
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
							shippingAddress = `<p class="${ classname }">`;
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

					// WCSG Gift details.
					if (
						data.hasOwnProperty( 'newspack_wcsg_is_gift' ) &&
						data.hasOwnProperty( 'wcsg_gift_recipients_email' )
					) {
						if ( !! data.newspack_wcsg_is_gift && !! data.wcsg_gift_recipients_email ) {
							html.push( '<div class="gift-details">' );
							html.push( '<h2>' + newspackBlocksModalCheckout.labels.gift_recipient + '</h2>' );
							html.push( `<p class="${ classname }">` + data.wcsg_gift_recipients_email + '</p>' );
						}
					}

					$( '.order-details-summary' ).after(
						'<div id="checkout_details">' + html.join( '' ) + '</div>'
					);
				}

				/**
				 * Validate the checkout form using Woo's "update_totals" ajax request.
				 *
				 * @param {boolean}  silent Whether to show errors or not.
				 * @param {Function} cb     Callback function.
				 */
				function validateForm( silent = false, cb = () => {} ) {
					if ( $form.is( '.processing' ) ) {
						return false;
					}
					clearNotices();
					$form.addClass( 'processing' ).block( {
						message: null,
						overlayCSS: {
							background: '#fff',
							opacity: 0.6,
						},
					} );

					// Remove generic errors.
					const $genericErrors = $form.find(
						'.woocommerce-NoticeGroup.woocommerce-NoticeGroup-checkout'
					);
					if ( $genericErrors.length ) {
						$genericErrors.remove();
					}

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
								setEditingDetails( false );
							} else if ( ! silent ) {
								if ( result.messages ) {
									handleFormError( result.messages );
								} else {
									handleFormError(
										`<div class="${ newspackBlocksModalCheckout.newspack_class_prefix }__inline-error">` +
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
		}
	} )( jQuery )
);
