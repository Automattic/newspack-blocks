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
	const initialHeight = '600px'; // Fixed initial height to avoid too much layout shift.
	const iframe = document.createElement( 'iframe' );
	iframe.name = IFRAME_NAME;
	iframe.style.height = initialHeight;
	iframe.style.visibility = 'hidden';

	function iframeReady( cb ) {
		if ( iframe._readyTimer ) {
			clearTimeout( iframe._readyTimer );
		}
		let fired = false;

		function ready() {
			if ( ! fired ) {
				fired = true;
				clearTimeout( iframe._readyTimer );
				cb.call( this );
			}
		}
		function readyState() {
			if ( this.readyState === "complete" ) {
				ready.call( this );
			}
		}
		function checkLoaded() {
			if ( iframe._ready ) {
				clearTimeout( iframe._readyTimer );
				return;
			}
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if ( doc && doc.URL.indexOf('about:') !== 0 ) {
				if ( doc?.readyState === 'complete' ) {
					ready.call( doc );
				} else {
					doc.addEventListener( 'DOMContentLoaded', ready );
					doc.addEventListener( 'readystatechange', readyState );
				}
			} else {
				iframe._readyTimer = setTimeout( checkLoaded, 10 );
			}
		}
		checkLoaded();
	}

	/**
	 * Handle iframe load state.
	 */
	function handleIframeReady() {
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
		const setModalReady = () => {
			iframeResizeObserver.observe( container );
			if ( spinner.style.display !== 'none' ) {
				spinner.style.display = 'none';
			}
			if ( iframe.style.visibility !== 'visible' ) {
				iframe.style.visibility = 'visible';
			}
			iframe._ready = true;
		}
		if ( container ) {
			if ( container.checkoutComplete ) {
				// Update the modal title and width to reflect successful transaction.
				setModalSize( 'small' );
				setModalTitle( newspackBlocksModal.labels.thankyou_modal_title );
				setModalReady();
				a11y.trapFocus( modalCheckout.querySelector( `.${ MODAL_CLASS_PREFIX }` ) );
			} else {
				// Revert modal title and width default value.
				setModalSize();
				setModalTitle( newspackBlocksModal.labels.checkout_modal_title );
			}
			if ( container.checkoutReady ) {
				setModalReady();
			} else {
				container.addEventListener( 'checkout-ready', setModalReady );
			}
		}
	}

	iframe.addEventListener( 'load', handleIframeReady );

	/**
	 * Generate cart via ajax.
	 *
	 * This strategy, used for anonymous users, addresses an edge case in which
	 * the session for a newly registered reader fails to carry the cart over to
	 * the checkout.
	 *
	 * @return {Promise} The promise that resolves with the checkout URL.
	 */
	const generateCart = ( formData ) => {
		return new Promise( ( resolve, reject ) => {
			const urlParams = new URLSearchParams( formData );
			urlParams.append( 'action', 'modal_checkout_request' );
			fetch( newspackBlocksModal.ajax_url + '?' + urlParams.toString() )
				.then( res => {
					if ( ! res.ok ) {
						reject( res );
					}
					res.json()
						.then( jsonData => {
							resolve( jsonData.url );
						} )
						.catch( reject );
				} )
				.catch( reject );
		} );
	}

	/**
	 * Handle checkout form submit.
	 *
	 * @param {Event} ev
	 */
	const handleCheckoutFormSubmit = ev => {
		const form = ev.target;

		form.classList.add( 'modal-processing' );

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
							const existingInputs = singleVariationForm.querySelectorAll( 'input[name="' +  afterSuccessParam + '"]' );
							if ( 0 === existingInputs.length ) {
								singleVariationForm.appendChild( createHiddenInput( afterSuccessParam, formData.get( afterSuccessParam ) ) );
							}
						} );

						// Append the product data hidden inputs.
						const variationData = singleVariationForm.dataset.product;
						if ( variationData ) {
							const data = JSON.parse( variationData );
							Object.keys( data ).forEach( key => {
								const existingInputs = singleVariationForm.querySelectorAll( 'input[name="' +  key + '"]' );
								if ( 0 === existingInputs.length ) {
									singleVariationForm.appendChild( createHiddenInput( key, data[ key ] ) );
								}
							} );
						}
					} );

				// Open the variations modal.
				ev.preventDefault();
				form.classList.remove( 'modal-processing' );
				openModal( variationModal );
				a11y.trapFocus( variationModal, false );

				// Set up some GA4 information.
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

		form.classList.remove( 'modal-processing' );

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
			let productId = '';

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

			// Get IDs for donation frequencies, and compare them to the selected frequency.
			const freqIds = JSON.parse( formData.get( 'frequency_ids' ) );
			for ( const freq in freqIds ) {
				if ( freq === donationFreq ) {
					productId = freqIds[freq].toString();
				}
			}

			// Get product information together to be appended to the modal for GA4 events outside of the iframe.
			getProductDataModal = {
				amount: donationValue,
				action_type: 'donation',
				currency: formData.get( 'donation_currency' ),
				product_id: productId,
				product_type: 'donation',
				recurrence: donationFreq,
				referrer: formData.get( '_wp_http_referer' ),
			};
		}

		if (
			typeof newspack_ras_config !== 'undefined' &&
			! newspack_ras_config?.is_logged_in &&
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

			// Generate cart asynchroneously.
			const cartReq = generateCart( formData );

			// Update pending checkout URL.
			cartReq.then( url => {
				window.newspackReaderActivation?.setPendingCheckout?.( url );
			} );

			// Initialize auth flow if reader is not authenticated.
			window.newspackReaderActivation.openAuthModal( {
				title: newspackBlocksModal.labels.auth_modal_title,
				callback: ( message, authData ) => {
					cartReq.then( url => {
						// If registered, append the registration flag query param to the url.
						if ( authData?.registered ) {
							url += `&${ newspackBlocksModal.checkout_registration_flag }=1`;
						}
						const checkoutForm = generateCheckoutPageForm( url );
						triggerCheckout( checkoutForm );
					} )
					.catch( error => {
						console.warn( 'Unable to generate cart:', error ); // eslint-disable-line no-console
						closeCheckout();
					} );
				},
				skipSuccess: true,
				skipNewslettersSignup: true,
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
			// Append product data info to the modal, so we can grab it for GA4 events outside of the iframe.
			document
				.getElementById( 'newspack_modal_checkout' )
				.setAttribute( 'data-order-details', JSON.stringify( getProductDataModal ) );
		}
	};

	/**
	 * Generate checkout page form.
	 *
	 * A form that goes directly to checkout in case the cart has already been
	 * created.
	 */
	const generateCheckoutPageForm = checkoutUrl => {
		const checkoutForm = document.createElement( 'form' );
		checkoutForm.method = 'POST';
		checkoutForm.action = checkoutUrl;
		checkoutForm.target = IFRAME_NAME;
		checkoutForm.style.display = 'none';

		const submitButton = document.createElement( 'button' );
		submitButton.setAttribute( 'type', 'submit' );

		checkoutForm.appendChild( submitButton );
		document.body.appendChild( checkoutForm );

		checkoutForm.addEventListener( 'submit', handleCheckoutFormSubmit );

		return checkoutForm;
	}

	const iframeResizeObserver = new ResizeObserver( entries => {
		if ( ! entries || ! entries.length ) {
			return;
		}
		const contentRect = entries[ 0 ].contentRect;
		if ( contentRect ) {
			const iframeHeight = contentRect.top + contentRect.bottom;
			if ( iframeHeight === 0 ) {
				// If height is 0, hide iframe content instead of resizing to avoid layout shift.
				iframe.style.visibility = 'hidden';
				return;
			}
			// Match iframe and modal content heights to avoid inner iframe scollbar.
			modalContent.style.height = iframeHeight + 'px';
			iframe.style.height = iframeHeight + 'px';
		}
	} );
	const closeCheckout = () => {
		const container = iframe?.contentDocument?.querySelector( `#${ IFRAME_CONTAINER_ID }` );
		const afterSuccessUrlInput = container?.querySelector( 'input[name="after_success_url"]' );
		const afterSuccessBehaviorInput = container?.querySelector(
			'input[name="after_success_behavior"]'
		);
		const hasNewsletterPopup = document?.querySelector( '.newspack-newsletters-signup-modal' );

		// We want to block closing the modal if redirecting elsewhere:
		const shouldCloseModal = ! afterSuccessUrlInput || ! afterSuccessBehaviorInput || ! container?.checkoutComplete;

		if ( shouldCloseModal || hasNewsletterPopup ) {
			spinner.style.display = 'flex';
			if ( iframe && modalContent.contains( iframe ) ) {
				// Reset iframe and modal content heights.
				iframe._ready = false;
				iframe.src = 'about:blank';
				iframe.style.height = initialHeight;
				iframe.style.visibility = 'hidden';
				modalContent.style.height = initialHeight;
				modalContent.removeChild( iframe );
			}

			if ( iframeResizeObserver ) {
				iframeResizeObserver.disconnect();
			}

			document.querySelectorAll( `.${ MODAL_CLASS_PREFIX }-container` ).forEach( el => closeModal( el ) );

			if ( modalTrigger ) {
				modalTrigger.focus();
			}
		}

		if ( container?.checkoutComplete ) {
			const handleCheckoutComplete = () => {
				if ( afterSuccessUrlInput && afterSuccessBehaviorInput ) {
					const afterSuccessUrl = afterSuccessUrlInput.getAttribute( 'value' );
					const afterSuccessBehavior = afterSuccessBehaviorInput.getAttribute( 'value' );

					if ( 'custom' === afterSuccessBehavior ) {
						window.location.href = afterSuccessUrl;
					} else if ( 'referrer' === afterSuccessBehavior ) {
						window.history.back();
					}
				}
				window?.newspackReaderActivation?.setPendingCheckout?.();
			};

			if ( window?.newspackReaderActivation?.openNewslettersSignupModal ) {
				window.newspackReaderActivation.openNewslettersSignupModal( {
					callback: handleCheckoutComplete,
					closeOnSuccess: shouldCloseModal,
				} );
			} else {
				handleCheckoutComplete();
			}

			// Ensure we always reset the modal title and width once the modal closes.
			if ( shouldCloseModal ) {
				setModalSize();
				setModalTitle( newspackBlocksModal.labels.checkout_modal_title );
			}
		} else {
			window?.newspackReaderActivation?.setPendingCheckout?.();

			// Track a dismissal event (modal has been manually closed without completing the checkout).
			manageDismissed();
			document.getElementById( 'newspack_modal_checkout' ).removeAttribute( 'data-order-details' );
		}
	};

	const openCheckout = () => {
		spinner.style.display = 'flex';
		openModal( modalCheckout );
		modalContent.appendChild( iframe );
		modalCheckout.addEventListener( 'click', ev => {
			if ( ev.target === modalCheckout ) {
				closeCheckout();
			}
		} );

		a11y.trapFocus( modalCheckout, iframe );

		iframeReady( handleIframeReady );
	};

	const closeModal = el => {
		if ( el.overlayId && window.newspackReaderActivation?.overlays ) {
			window.newspackReaderActivation?.overlays.remove( el.overlayId );
		}
		el.setAttribute( 'data-state', 'closed' );
		document.body.style.overflow = 'auto';
	};

	const openModal = el => {
		if ( window.newspackReaderActivation?.overlays ) {
			modalCheckout.overlayId = window.newspackReaderActivation?.overlays.add();
		}
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
	 * Sets the size of the modal.
	 *
	 * @param {string} size Options are 'small' or 'default'. Default is 'default'.
	 */
	const setModalSize = ( size = 'default' ) => {
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
				form.addEventListener( 'submit', handleCheckoutFormSubmit );
			} );
		} );

	/**
	 * Triggers checkout form submit.
	 *
	 * @param {HTMLFormElement} form The form element.
	 */
	const triggerCheckout = form => {
		// form.submit does not trigger submit event listener, so we use requestSubmit.
		form.requestSubmit( form.querySelector( 'button[type="submit"]' ) );
	}

	/**
	 * Handle donation form triggers.
	 *
	 * @param {string}      layout    The donation layout.
	 * @param {string}      frequency The donation frequency.
	 * @param {string}      amount    The donation amount.
	 * @param {string|null} other     Optional. The custom amount when other is selected.
	 */
	const triggerDonationForm = ( layout, frequency, amount, other = null ) => {
		let form;
		document.querySelectorAll( '.wpbnbd.wpbnbd--platform-wc form' )
			.forEach( donationForm => {
				const frequencyInput = donationForm.querySelector( `input[name="donation_frequency"][value="${ frequency }"]` );
				if ( ! frequencyInput ) {
					return;
				}
				if ( layout === 'tiered' ) {
					const frequencyButton = document.querySelector( `button[data-frequency-slug="${ frequency }"]` );
					if ( ! frequencyButton ) {
						return;
					}
					frequencyButton.click();
					const submitButton = donationForm.querySelector( `button[type="submit"][name="donation_value_${ frequency }"][value="${ amount }"]` );
					if ( ! submitButton ) {
						return;
					}
					submitButton.click();
				} else {
					const amountInput = ( layout === 'untiered' ) ?
						donationForm.querySelector( `input[name="donation_value_${ frequency }_untiered"]` ) :
						donationForm.querySelector( `input[name="donation_value_${ frequency }"][value="${ amount }"]` );
					if ( frequencyInput && amountInput ) {
						frequencyInput.checked = true;
						if ( layout === 'untiered' ) {
							amountInput.value = amount;
						} else if ( amount === 'other' ) {
							amountInput.click();
							const otherInput = donationForm.querySelector( `input[name="donation_value_${ frequency }_other"]` );
							if ( otherInput && other ) {
								otherInput.value = other;
							}
						} else {
							amountInput.checked = true;
						}
						form = donationForm;
					}
				}
			} );
		if ( form ) {
			triggerCheckout( form );
		}
	}

	/**
	 * Handle checkout button form triggers.
	 *
	 * @param {number}      productId   The product ID.
	 * @param {number|null} variationId Optional. The variation ID.
	 */
	const triggerCheckoutButtonForm = ( productId, variationId = null ) => {
		let form;
		if ( variationId && variationId !== productId ) {
			const variationModals = document.querySelectorAll( `.${ VARIATON_MODAL_CLASS_PREFIX }` );
			const variationModal = [ ...variationModals ].find(
				modal => modal.dataset.productId === productId
			);
			if ( variationModal ) {
				const forms = variationModal.querySelectorAll( `form[target="${ IFRAME_NAME }"]` );
				forms.forEach( variationForm => {
					const productData = JSON.parse( variationForm.dataset.product );
					if ( productData?.variation_id === Number( variationId ) ) {
						form = variationForm;
					}
				} );
			}
		} else {
			const checkoutButtons = document.querySelectorAll( '.wp-block-newspack-blocks-checkout-button' );
			checkoutButtons.forEach( button => {
				const checkoutButtonForm = button.querySelector( 'form' );
				if ( ! checkoutButtonForm ) {
					return;
				}
				const productData = JSON.parse( checkoutButtonForm.dataset.product );
				if ( productData?.product_id === productId ) {
					form = checkoutButtonForm;
				}
			} );
		}
		if ( form ) {
			triggerCheckout( form );
		}
	}

	/**
	 * Handle modal checkout url param triggers.
	 */
	const handleModalCheckoutUrlParams = () => {
		const urlParams = new URLSearchParams( window.location.search );
		if ( ! urlParams.has( 'checkout' ) ) {
			return;
		}
		const type = urlParams.get( 'type' );
		if ( type === 'donate' ) {
			const layout = urlParams.get( 'layout' );
			const frequency = urlParams.get( 'frequency' );
			const amount = urlParams.get( 'amount' );
			const other = urlParams.get( 'other' );
			if ( layout && frequency && amount ) {
				triggerDonationForm( layout, frequency, amount, other );
			}
		} else if ( type === 'checkout_button' ) {
			const productId = urlParams.get( 'product_id' );
			const variationId = urlParams.get( 'variation_id' );
			if ( productId ) {
				triggerCheckoutButtonForm( productId, variationId );
			}
		} else {
			const url = window.newspackReaderActivation?.getPendingCheckout?.();
			if ( url ) {
				const form = generateCheckoutPageForm( url );
				triggerCheckout( form );
			}
		}
		// Remove the URL param to prevent re-triggering.
		window.history.replaceState( null, null, window.location.pathname );
	};
	handleModalCheckoutUrlParams();
} );
