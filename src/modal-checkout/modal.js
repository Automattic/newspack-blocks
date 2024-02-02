/* globals newspackBlocksModal */

/**
 * Style dependencies
 */
import './modal.scss';

/**
 * Specify a function to execute when the DOM is fully loaded.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/dom-ready/
 *
 * @param {Function} callback A function to execute after the DOM is ready.
 * @return {void}
 */
function domReady( callback ) {
	if ( typeof document === 'undefined' ) {
		return;
	}
	if (
		document.readyState === 'complete' || // DOMContentLoaded + Images/Styles/etc loaded, so we call directly.
		document.readyState === 'interactive' // DOMContentLoaded fires at this point, so we call directly.
	) {
		return void callback();
	}
	// DOMContentLoaded has not fired yet, delay callback until then.
	document.addEventListener( 'DOMContentLoaded', callback );
}

domReady( () => {
	const CLASSNAME_BASE = newspackBlocksModal.newspack_class_prefix;
	const IFRAME_NAME = 'newspack_modal_checkout_iframe';
	const MODAL_CHECKOUT_ID = 'newspack_modal_checkout';
	const MODAL_CLASSNAME_BASE = `${ CLASSNAME_BASE }__modal`;

	// Initialize empty iframe.
	const iframe = document.createElement( 'iframe' );
	iframe.name = IFRAME_NAME;

	const modalCheckout = document.querySelector( `#${ MODAL_CHECKOUT_ID }` );
	const modalContent = modalCheckout.querySelector( `.${ MODAL_CLASSNAME_BASE }__content` );
	const modalCheckoutHiddenInput = document.createElement( 'input' );
	modalCheckoutHiddenInput.type = 'hidden';
	modalCheckoutHiddenInput.name = 'modal_checkout';
	modalCheckoutHiddenInput.value = '1';

	const spinner = modalContent.querySelector( `.${ CLASSNAME_BASE }__spinner` );
	const triggers = `.wpbnbd.wpbnbd--platform-wc,.wp-block-newspack-blocks-checkout-button,.${ CLASSNAME_BASE }__modal-variation`;

	let iframeResizeObserver;

	function closeCheckout() {
		if ( iframe ) {
			iframe.src = 'about:blank';
		}
		if ( iframeResizeObserver ) {
			iframeResizeObserver.disconnect();
		}
		Array.from( document.querySelectorAll( `.${ MODAL_CLASSNAME_BASE }-container` ) ).forEach(
			el => {
				closeModal( el );
				if ( el.overlayId && window.newspackReaderActivation?.overlays ) {
					window.newspackReaderActivation?.overlays.remove( el.overlayId );
				}
			}
		);
	}

	const openCheckout = ( form, submit = false ) => {
		spinner.style.display = 'flex';
		openModal( modalCheckout );

		if ( window.newspackReaderActivation?.overlays ) {
			modalCheckout.overlayId = window.newspackReaderActivation?.overlays.add();
		}

		if ( submit ) {
			form.submit();
		}

		if ( ! modalCheckout ) {
			return;
		}

		const initialHeight = modalContent.clientHeight + 'px';
		modalContent.appendChild( iframe );
		modalCheckout.addEventListener( 'click', ev => {
			if ( ev.target === modalCheckout ) {
				closeCheckout();
			}
		} );
		const closeButtons = modalCheckout.querySelectorAll( `.${ MODAL_CLASSNAME_BASE }__close` );
		closeButtons.forEach( button => {
			button.addEventListener( 'click', ev => {
				ev.preventDefault();
				modalContent.style.height = initialHeight;
				spinner.style.display = 'flex';
				closeCheckout();
			} );
		} );

		/**
		 * Variation modals.
		 */
		const variationModals = document.querySelectorAll( `.${ MODAL_CLASSNAME_BASE }-variation` );
		variationModals.forEach( variationModal => {
			variationModal.addEventListener( 'click', ev => {
				if ( ev.target === variationModal ) {
					closeCheckout();
				}
			} );
			variationModal.querySelectorAll( `.${ MODAL_CLASSNAME_BASE }__close` ).forEach( button => {
				button.addEventListener( 'click', ev => {
					ev.preventDefault();
					closeCheckout();
				} );
			} );
		} );
	};

	function closeModal( el ) {
		el.setAttribute( 'data-state', 'closed' );
	}

	function openModal( el ) {
		el.setAttribute( 'data-state', 'open' );
	}

	window.newspackCloseModalCheckout = closeCheckout;

	/**
	 * Handle triggers.
	 */
	const elements = document.querySelectorAll( triggers );
	elements.forEach( element => {
		const forms = element.querySelectorAll( 'form' );
		forms.forEach( form => {
			form.appendChild( modalCheckoutHiddenInput.cloneNode() );
			form.target = IFRAME_NAME;

			// Fill in the referrer field.
			const afterSuccessUrlInput = form.querySelector( 'input[name="after_success_url"]' );
			const afterSuccessBehaviorInput = form.querySelector(
				'input[name="after_success_behavior"]'
			);
			if (
				afterSuccessBehaviorInput &&
				afterSuccessUrlInput &&
				'referrer' === afterSuccessBehaviorInput.getAttribute( 'value' )
			) {
				afterSuccessUrlInput.setAttribute( 'value', document.referrer || window.location.href );
			}

			form.addEventListener( 'submit', ev => {
				const formData = new FormData( form );
				const variationModals = modalCheckout.querySelectorAll(
					`.${ MODAL_CLASSNAME_BASE }-variation`
				);
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
							.querySelectorAll( 'form[target="newspack_modal_checkout"]' )
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
				iframeResizeObserver = new ResizeObserver( entries => {
					if ( ! entries || ! entries.length ) {
						return;
					}
					const contentRect = entries[ 0 ].contentRect;
					if ( contentRect ) {
						// Match iframe and modal content heights to avoid inner iframe scollbar.
						modalContent.style.height = contentRect.top + contentRect.bottom + 'px';
						iframe.style.height = contentRect.top + contentRect.bottom + 'px';
					}
				} );

				if ( window.newspackReaderActivation?.openAuthModal ) {
					ev.preventDefault();
					window.newspackReaderActivation.openAuthModal( {
						title: 'Complete your transaction',
						callback: () => openCheckout( form, true ),
						skipSuccess: true,
						labels: {
							signin: {
								title: 'Sign in to complete transaction',
							},
							register: {
								title: 'Complete your transaction',
							},
						},
						content: '<p>Product Information Here</p>',
					} );
				} else {
					openCheckout( form, false );
				}
			} );
		} );
	} );

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
		const container = iframe.contentDocument.querySelector( '#newspack_modal_checkout_containter' );
		if ( container ) {
			iframeResizeObserver.observe( container );
			if ( container.checkoutReady ) {
				spinner.style.display = 'none';
			} else {
				container.addEventListener( 'checkout-ready', () => {
					spinner.style.display = 'none';
				} );
			}
		} else {
			spinner.style.display = 'none';
		}
	} );
} );
