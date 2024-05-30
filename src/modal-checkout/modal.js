/* globals newspackBlocksModal, newspack_ras_config */

/**
 * Style dependencies
 */
import './modal.scss';

/**
 * Internal dependencies
 */
import { createHiddenInput, domReady } from './utils';

const CLASS_PREFIX = newspackBlocksModal.newspack_class_prefix;
const IFRAME_NAME = 'newspack_modal_checkout_iframe';
const IFRAME_CONTAINER_ID = 'newspack_modal_checkout_container';
const MODAL_CHECKOUT_ID = 'newspack_modal_checkout';
const MODAL_CLASS_PREFIX = `${ CLASS_PREFIX }__modal`;

domReady( () => {
	const modalCheckout = document.querySelector( `#${ MODAL_CHECKOUT_ID }` );

	if ( ! modalCheckout ) {
		return;
	}

	const modalContent = modalCheckout.querySelector( `.${ MODAL_CLASS_PREFIX }__content` );
	const spinner = modalContent.querySelector( `.${ CLASS_PREFIX }__spinner` );
	const modalCheckoutHiddenInput = createHiddenInput( 'modal_checkout', '1' );

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
			};
			if ( window?.newspackReaderActivation?.openNewslettersSignupModal ) {
				window.newspackReaderActivation.openNewslettersSignupModal( {
					callback: handleCheckoutComplete,
				} );
			} else {
				handleCheckoutComplete();
			}
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
	};

	const closeModal = el => {
		el.setAttribute( 'data-state', 'closed' );
		document.body.style.overflow = 'auto';
	};

	const openModal = el => {
		el.setAttribute( 'data-state', 'open' );
		document.body.style.overflow = 'hidden';
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
							form.appendChild( createHiddenInput( key, data[ key ] ) );
						} );
					}
					const formData = new FormData( form );
					const variationModals = document.querySelectorAll( `.${ MODAL_CLASS_PREFIX }-variation` );
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
							return;
						}
					}

					form.classList.remove( 'processing' );
					if (
						window?.newspackReaderActivation?.openAuthModal &&
						! window?.newspackReaderActivation?.getReader?.()?.authenticated &&
						! newspack_ras_config.is_logged_in
					) {
						ev.preventDefault();

						const data = new FormData( form );
						let content = '';
						let price = '0';
						let priceSummary = '';

						if ( data.get( 'newspack_donate' ) ) {
							const frequency = data.get( 'donation_frequency' );
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
											let otherPrice = data.get( `donation_value_${ frequency }_other` );

											// Fallback to untiered price if other price is not set.
											if ( ! otherPrice ) {
												otherPrice = data.get( `donation_value_${ frequency }_untiered` );
											}

											if ( otherPrice ) {
												priceSummary = priceSummary.replace( '0', otherPrice );
											}
										}
									} );
								} else {
									// Handle tiers based donation tiers.
									const index = data.get( 'donation_tier_index' );
									if ( index ) {
										const donationData = JSON.parse( donationTiers?.[ index ].dataset.product );
										if ( donationData.hasOwnProperty( `donation_price_summary_${ frequency }` ) ) {
											priceSummary = donationData[ `donation_price_summary_${ frequency }` ];
										}
									}
								}
							}
						} else if ( data.get( 'newspack_checkout' ) ) {
							const priceSummaryInput = form.querySelector( 'input[name="product_price_summary"]' );

							if ( priceSummaryInput ) {
								priceSummary = priceSummaryInput.value;
							}
						}

						if ( priceSummary ) {
							content = `<div class="order-details-summary ${ CLASS_PREFIX }__box ${ CLASS_PREFIX }__box--text-center"><h2>${ priceSummary }</h2></div>`;
						}

						// Initialize auth flow if reader is not authenticated.
						window.newspackReaderActivation.openAuthModal( {
							title: newspackBlocksModal.labels.auth_modal_title,
								// Add hidden input to signify checkout registration.
								const input = document.createElement( 'input' );
								input.type = 'hidden';
								input.name = '_newspack_checkout_registration';
								input.value = '1';
								form.appendChild( input );
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
						} );
					} else {
						// Otherwise initialize checkout.
						openCheckout();
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
