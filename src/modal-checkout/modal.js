/* globals newspackBlocksModal, newspack_ras_config */

/**
 * Style dependencies
 */
import './modal.scss';

/**
 * Internal dependencies
 */
import { domReady } from './utils';

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
	const modalCheckoutHiddenInput = document.createElement( 'input' );
	const spinner = modalContent.querySelector( `.${ CLASS_PREFIX }__spinner` );
	modalCheckoutHiddenInput.type = 'hidden';
	modalCheckoutHiddenInput.name = 'modal_checkout';
	modalCheckoutHiddenInput.value = '1';

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

		const container = iframe.contentDocument.querySelector( `#${ IFRAME_CONTAINER_ID }` );

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

		if ( container.checkoutComplete ) {
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
					const formData = new FormData( form );
					const variationModals = document.querySelectorAll( '.newspack-blocks__modal-variation' );

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
							// Fill in the after success variables in the variation modal.
							variationModal
								.querySelectorAll( `form[target="${ IFRAME_NAME }"]` )
								.forEach( singleVariationForm => {
									[
										'after_success_behavior',
										'after_success_url',
										'after_success_button_label',
									].forEach( afterSuccessParam => {
										const input = document.createElement( 'input' );
										input.type = 'hidden';
										input.name = afterSuccessParam;
										input.value = formData.get( afterSuccessParam );
										singleVariationForm.appendChild( input );
									} );
								} );
							// Open the variations modal.
							ev.preventDefault();
							openModal( variationModal );
							return;
						}
					}
					if (
						window?.newspackReaderActivation?.openAuthModal &&
						! window?.newspackReaderActivation?.getReader?.()?.authenticated &&
						! newspack_ras_config.is_logged_in
					) {
						ev.preventDefault();

						// Initialize auth flow content string.
						let content = '';

						const data = new FormData();
						data.append( 'action', 'get_price_summary_card_markup' );
						data.append( 'security', newspackBlocksModal.newspack_nonce );
						if ( formData.has( 'newspack_donate' ) ) {
							const frequency = formData.get( 'donation_frequency' );

							data.append( 'is_donation', true );
							data.append( 'frequency', frequency );

							for ( const [ key, value ] of formData.entries() ) {
								if ( key.includes( frequency ) && !! value ) {
									data.append( 'price', value );
								}
							}
						}

						if ( formData.has( 'newspack_checkout' ) ) {
							data.append( 'product_id', formData.get( 'product_id' ) );
							data.append( 'price', formData.get( 'price' ) );
						}

						// Fetch price summary card markup.
						fetch( newspackBlocksModal.newspack_ajax_url, {
							method: 'POST',
							body: data,
						} )
							.then( response => response.json() )
							.then( res => {
								if ( res.success ) {
									content = res.data;
								}
							} )
							.finally( () => {
								// Initialize auth flow if reader is not authenticated.
								window.newspackReaderActivation.openAuthModal( {
									title: newspackBlocksModal.labels.auth_modal_title,
									callback: () =>
										// form.submit does not trigger submit event listener, so we use requestSubmit.
										form.requestSubmit( form.querySelector( 'button[type="submit"]' ) ),
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
		const container = iframe.contentDocument.querySelector( `#${ IFRAME_CONTAINER_ID }` );
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
