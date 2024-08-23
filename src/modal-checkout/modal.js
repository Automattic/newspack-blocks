/* globals newspackBlocksModal, newspack_ras_config */

/**
 * Style dependencies
 */
import './modal.scss';
import * as a11y from './accessibility.js';

/**
 * Internal dependencies
 */
import { manageDismissed, manageOpened } from './analytics';
import { createHiddenInput, domReady } from './utils';

const CLASS_PREFIX = newspackBlocksModal.newspack_class_prefix;
const IFRAME_NAME = 'newspack_modal_checkout_iframe';
const IFRAME_CONTAINER_ID = 'newspack_modal_checkout_container';
const MODAL_CHECKOUT_ID = 'newspack_modal_checkout';
const MODAL_CLASS_PREFIX = `${ CLASS_PREFIX }__modal`;
const VARIATON_MODAL_CLASS_PREFIX = 'newspack-blocks__modal-variation';

let getProductDataModal = {};

domReady( () => {
	const modalCheckout = document.querySelector( `#${ MODAL_CHECKOUT_ID }` );

	if ( ! modalCheckout ) {
		return;
	}

	const modalContent = modalCheckout.querySelector( `.${ MODAL_CLASS_PREFIX }__content` );
	const modalCheckoutHiddenInput = createHiddenInput( 'modal_checkout', '1' );
	const spinner = modalContent.querySelector( `.${ CLASS_PREFIX }__spinner` );
	let modalTrigger = document.querySelector( '.newspack-reader__account-link' )?.[0];

	// Initialize empty iframe.
	const iframe = document.createElement( 'iframe' );
	iframe.name = IFRAME_NAME;

	const iframeResizeObserver = new ResizeObserver( entries => {
		if ( ! entries || ! entries.length ) {
			return;
		}
		const contentRect = entries[ 0 ].contentRect;
		if ( contentRect ) {
			const iframeHeight = contentRect.top + contentRect.bottom + 'px';
			// Match iframe and modal content heights to avoid inner iframe scollbar.
			modalContent.style.height = iframeHeight;
			iframe.style.height = iframeHeight;
		}
	} );

	const initialHeight = modalContent.clientHeight + spinner.clientHeight + 'px';
	const closeCheckout = () => {
		spinner.style.display = 'flex';

		const container = iframe?.contentDocument?.querySelector( `#${ IFRAME_CONTAINER_ID }` );

		if ( iframe && modalContent.contains( iframe ) ) {
			// Reset iframe and modal content heights.
			iframe.src = 'about:blank';
			iframe.style.height = '0';
			modalContent.removeChild( iframe );
			modalContent.style.height = initialHeight;
		}

		if ( iframeResizeObserver ) {
			iframeResizeObserver.disconnect();
		}

		document.querySelectorAll( `.${ MODAL_CLASS_PREFIX }-container` ).forEach( el => {
			closeModal( el );
			if ( el.overlayId && window.newspackReaderActivation?.overlays ) {
				window.newspackReaderActivation?.overlays.remove( el.overlayId );
			}
		} );

		if ( modalTrigger ) {
			modalTrigger.focus();
		}

		if ( container?.checkoutComplete ) {
			const handleCheckoutComplete = () => {
				const afterSuccessUrlInput = container.querySelector( 'input[name="after_success_url"]' );
				const afterSuccessBehaviorInput = container.querySelector(
					'input[name="after_success_behavior"]'
				);

				if ( afterSuccessUrlInput && afterSuccessBehaviorInput ) {
					const afterSuccessUrl = afterSuccessUrlInput.getAttribute( 'value' );
					const afterSuccessBehavior = afterSuccessBehaviorInput.getAttribute( 'value' );

					if ( 'custom' === afterSuccessBehavior ) {
						window.location.href = afterSuccessUrl;
					} else if ( 'referrer' === afterSuccessBehavior ) {
						window.history.back();
					}
				}
				window?.newspackReaderActivation?.setCheckoutStatus?.( false );
			};
			if ( window?.newspackReaderActivation?.openNewslettersSignupModal ) {
				window.newspackReaderActivation.openNewslettersSignupModal( {
					callback: handleCheckoutComplete,
				} );
			} else {
				handleCheckoutComplete();
			}
			// Ensure we always reset the modal title and width once the modal closes.
			setModalWidth();
			setModalTitle( newspackBlocksModal.labels.checkout_modal_title );
		} else {
			window?.newspackReaderActivation?.setCheckoutStatus?.( false );

			// Track a dismissal event (modal has been manually closed without completing the checkout).
			manageDismissed();
			document.getElementById( 'newspack_modal_checkout' ).removeAttribute( 'data-order-details' );
		}
	};

	const openCheckout = () => {
		spinner.style.display = 'flex';
		openModal( modalCheckout );

		if ( window.newspackReaderActivation?.overlays ) {
			modalCheckout.overlayId = window.newspackReaderActivation?.overlays.add();
		}

		modalContent.appendChild( iframe );
		modalCheckout.addEventListener( 'click', ev => {
			if ( ev.target === modalCheckout ) {
				closeCheckout();
			}
		} );

		a11y.trapFocus( modalCheckout, iframe );
	};

	const closeModal = el => {
		el.setAttribute( 'data-state', 'closed' );
		document.body.style.overflow = 'auto';
	};

	const openModal = el => {
		el.setAttribute( 'data-state', 'open' );
		document.body.style.overflow = 'hidden';
	};

	/**
	 * Set the modal title.
	 *
	 * @param {string} title The title to set.
	 */
	const setModalTitle = title => {
		const modalTitle = modalCheckout.querySelector( `.${ MODAL_CLASS_PREFIX }__header h2` );
		if ( ! modalTitle ) {
			return;
		}

		modalTitle.innerText = title;
	};

	/**
	 * Sets the width of the modal.
	 *
	 * @param {string} size Options are 'small' or 'default'. Default is 'default'.
	 */
	const setModalWidth = ( size = 'default' ) => {
		const modal = modalCheckout.querySelector( `.${ MODAL_CLASS_PREFIX }` );
		if ( ! modal ) {
			return;
		}

		if ( size === 'small' ) {
			modal.classList.add( `${ MODAL_CLASS_PREFIX }--small` );
		} else {
			modal.classList.remove( `${ MODAL_CLASS_PREFIX }--small` );
		}
	};

	window.newspackCloseModalCheckout = closeCheckout;

	/**
	 * Handle modal checkout close button.
	 */
	modalCheckout.querySelectorAll( `.${ MODAL_CLASS_PREFIX }__close` ).forEach( button => {
		button.addEventListener( 'click', ev => {
			ev.preventDefault();
			closeCheckout();
		} );
	} );

	/**
	 * Handle variations modal close button.
	 */
	document.querySelectorAll( '.newspack-blocks__modal-variation' ).forEach( variationModal => {
		variationModal.addEventListener( 'click', ev => {
			if ( ev.target === variationModal ) {
				closeCheckout();
			}
		} );
		variationModal.querySelectorAll( `.${ MODAL_CLASS_PREFIX }__close` ).forEach( button => {
			button.addEventListener( 'click', ev => {
				ev.preventDefault();
				closeCheckout();
			} );
		} );
	} );

	/**
	 * Close the modal with the escape key.
	 */
	document.addEventListener( 'keydown', function ( ev ) {
		if ( ev.key === 'Escape' ) {
			closeCheckout();
		}
	} );

	/**
	 * Handle modal checkout triggers.
	 */
	document
		.querySelectorAll(
			'.wpbnbd.wpbnbd--platform-wc, .wp-block-newspack-blocks-checkout-button, .newspack-blocks__modal-variation'
		)
		.forEach( element => {
			const forms = element.querySelectorAll( 'form' );
			forms.forEach( form => {
				form.appendChild( modalCheckoutHiddenInput.cloneNode() );
				form.target = IFRAME_NAME;
				form.addEventListener( 'submit', ev => {
					form.classList.add( 'processing' );

					const productData = form.dataset.product;

					if ( productData ) {
						const data = JSON.parse( productData );
						Object.keys( data ).forEach( key => {
							const existingInputs = form.querySelectorAll( 'input[name="' +  key + '"]' );
							if ( 0 === existingInputs.length ) {
								form.appendChild( createHiddenInput( key, data[ key ] ) );
							}
						} );
					}
					const formData = new FormData( form );

					// If we're not going from variation picker to checkout, set the modal trigger:
					if ( ! formData.get( 'variation_id' ) ) {
						modalTrigger = ev.submitter;
					}

					const variationModals = document.querySelectorAll( `.${ VARIATON_MODAL_CLASS_PREFIX }` );
					// Clear any open variation modal.
					variationModals.forEach( variationModal => {
						closeModal( variationModal );
					} );
					// Trigger variation modal if variation is not selected.
					if ( formData.get( 'is_variable' ) && ! formData.get( 'variation_id' ) ) {
						const variationModal = [ ...variationModals ].find(
							modal => modal.dataset.productId === formData.get( 'product_id' )
						);
						if ( variationModal ) {
							variationModal
								.querySelectorAll( `form[target="${ IFRAME_NAME }"]` )
								.forEach( singleVariationForm => {
									// Fill in the after success variables in the variation modal.
									[
										'after_success_behavior',
										'after_success_url',
										'after_success_button_label',
									].forEach( afterSuccessParam => {
										singleVariationForm.appendChild(
											createHiddenInput( afterSuccessParam, formData.get( afterSuccessParam ) )
										);
									} );

									// Append the product data hidden inputs.
									// TODOGA4: I've added more info to the params, is it needlessly being added here?
									const variationData = singleVariationForm.dataset.product;
									if ( variationData ) {
										const data = JSON.parse( variationData );
										Object.keys( data ).forEach( key => {
											singleVariationForm.appendChild( createHiddenInput( key, data[ key ] ) );
										} );
									}
								} );

							// Open the variations modal.
							ev.preventDefault();
							form.classList.remove( 'processing' );
							openModal( variationModal );
							a11y.trapFocus( variationModal, false );

							// TODOGA4: fix this duplication (see below):
							const getDataProduct = form.getAttribute( 'data-product' );
							getProductDataModal = getDataProduct ? JSON.parse( getDataProduct ) : {};
							manageOpened( getProductDataModal );

							// Append product data info to the modal itself, so we can grab it for manageDismissed:
							document
								.getElementById( 'newspack_modal_checkout' )
								.setAttribute( 'data-order-details', JSON.stringify( getProductDataModal ) );
							return;
						}
					}

					form.classList.remove( 'processing' );

					// Set reader activation checkout status flag if available.
					window?.newspackReaderActivation?.setCheckoutStatus?.( true );

					const isDonateBlock = formData.get( 'newspack_donate' );
					const isCheckoutButtonBlock = formData.get( 'newspack_checkout' );

					// Set up some GA4 information.
					if ( isCheckoutButtonBlock ) { // this fires on the second in-modal variations screen, too
						const getDataProduct = form.getAttribute( 'data-product' );
						getProductDataModal = getDataProduct ? JSON.parse( getDataProduct ) : {};
					} else if ( isDonateBlock ) {
						// Get donation information and append to the modal checkout for GA4:
						const donationFreq = formData.get( 'donation_frequency' );
						let donationValue = '';

						for ( const key of formData.keys() ) {
							// Find values that match the frequency name, that aren't empty
							if (
								key.indexOf( 'donation_value_' + donationFreq ) >= 0 &&
								'other' !== formData.get( key ) &&
								'' !== formData.get( key )
							) {
								donationValue = formData.get( key );
							}
						}

						// TODOGA4:
						getProductDataModal = {
							amount: donationValue,
							action_type: 'donation',
							currency: formData.get( 'donation_currency' ),
							product_id: formData.get( 'donation_product_id' ),
							product_type: 'donation',
							recurrence: donationFreq,
							referer: formData.get( '_wp_http_referer' ),
						};
					}

					if (
						! newspack_ras_config.is_logged_in &&
						! window?.newspackReaderActivation?.getReader?.()?.authenticated &&
						window?.newspackReaderActivation?.openAuthModal
					) {
						ev.preventDefault();

						let content = '';
						let price = '0';
						let priceSummary = '';

						if ( isDonateBlock ) {

							const frequency = formData.get( 'donation_frequency' );
							const donationTiers = form.querySelectorAll(
								`.donation-tier__${ frequency }, .donation-frequency__${ frequency }`
							);

							if ( donationTiers?.length ) {
								const frequencyInputs = form.querySelectorAll(
									`input[name="donation_value_${ frequency }"], input[name="donation_value_${ frequency }_untiered"]`
								);

								if ( frequencyInputs?.length ) {
									// Handle frequency based donation tiers.
									frequencyInputs.forEach( input => {
										if ( input.checked && input.value !== 'other' ) {
											price = input.value;
										}
									} );

									donationTiers.forEach( el => {
										const donationData = JSON.parse( el.dataset.product );
										if (
											donationData.hasOwnProperty( `donation_price_summary_${ frequency }` ) &&
											donationData?.[ `donation_price_summary_${ frequency }` ].includes( price )
										) {
											priceSummary = donationData[ `donation_price_summary_${ frequency }` ];
										}

										if ( price === '0' && priceSummary ) {
											// Replace placeholder price with price input for other.
											let otherPrice = formData.get( `donation_value_${ frequency }_other` );

											// Fallback to untiered price if other price is not set.
											if ( ! otherPrice ) {
												otherPrice = formData.get( `donation_value_${ frequency }_untiered` );
											}

											if ( otherPrice ) {
												priceSummary = priceSummary.replace( '0', otherPrice );
											}
										}
									} );
								} else {
									// Handle tiers based donation tiers.
									const index = formData.get( 'donation_tier_index' );
									if ( index ) {
										const donationData = JSON.parse( donationTiers?.[ index ].dataset.product );
										if ( donationData.hasOwnProperty( `donation_price_summary_${ frequency }` ) ) {
											priceSummary = donationData[ `donation_price_summary_${ frequency }` ];
										}
									}
								}
							}
						} else if ( isCheckoutButtonBlock ) {
							const priceSummaryInput = form.querySelector( 'input[name="product_price_summary"]' );

							if ( priceSummaryInput ) {
								priceSummary = priceSummaryInput.value;
							}
						}

						if ( priceSummary ) {
							content = `<div class="order-details-summary ${ CLASS_PREFIX }__box ${ CLASS_PREFIX }__box--text-center"><p><strong>${ priceSummary }</strong></p></div>`;
						}

						// Initialize auth flow if reader is not authenticated.
						window.newspackReaderActivation.openAuthModal( {
							title: newspackBlocksModal.labels.auth_modal_title,
							callback: () => {
								// Signal checkout registration.
								form.appendChild(
									createHiddenInput( newspackBlocksModal.checkout_registration_flag, '1' )
								);
								// form.submit does not trigger submit event listener, so we use requestSubmit.
								form.requestSubmit( form.querySelector( 'button[type="submit"]' ) );
							},
							skipSuccess: true,
							labels: {
								signin: {
									title: newspackBlocksModal.labels.signin_modal_title,
								},
								register: {
									title: newspackBlocksModal.labels.register_modal_title,
								},
							},
							content,
							trigger: ev.submitter,
						} );
					} else {
						// Otherwise initialize checkout.
						openCheckout();
						manageOpened( getProductDataModal );
						// Append product data info to the modal, so we can grab it for manageDismissed.
						document
							.getElementById( 'newspack_modal_checkout' )
							.setAttribute( 'data-order-details', JSON.stringify( getProductDataModal ) );
					}
				} );
			} );
		} );

	/**
	 * Handle iframe load state.
	 */
	iframe.addEventListener( 'load', () => {
		const location = iframe.contentWindow.location;
		// If RAS is available, set the front-end authentication.
		if ( window.newspackReaderActivation && location.href.indexOf( 'order-received' ) > -1 ) {
			const ras = window.newspackReaderActivation;
			const params = new Proxy( new URLSearchParams( location.search ), {
				get: ( searchParams, prop ) => searchParams.get( prop ),
			} );
			if ( params.email ) {
				ras.setReaderEmail( params.email );
				ras.setAuthenticated( true );
			}
		}
		const container = iframe?.contentDocument?.querySelector( `#${ IFRAME_CONTAINER_ID }` );
		if ( container ) {
			iframeResizeObserver.observe( container );
			if ( container.checkoutComplete ) {
				// Update the modal title and width to reflect successful transaction.
				setModalWidth( 'small' );
				setModalTitle( newspackBlocksModal.labels.thankyou_modal_title );
				a11y.trapFocus( modalCheckout.querySelector( `.${ MODAL_CLASS_PREFIX }` ) );
			} else {
				// Revert modal title and width default value.
				setModalWidth();
				setModalTitle( newspackBlocksModal.labels.checkout_modal_title );
			}
			if ( container.checkoutReady ) {
				spinner.style.display = 'none';
			} else {
				container.addEventListener( 'checkout-ready', () => {
					spinner.style.display = 'none';
				} );
			}
		} else if ( 'about:blank' !== location.href ) {
			// Make sure the iframe has actually loaded something, even if not the expected container.
			// This check prevents an issue in Chrome where the 'load' event fired twice and the spinner was hidden too soon.
			spinner.style.display = 'none';
		}
	} );
} );
