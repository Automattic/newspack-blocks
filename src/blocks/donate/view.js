/**
 * Style dependencies
 */

import './styles/view.scss';

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

let iframeResizeObserver;

function closeCheckout( element ) {
	const iframe = element.querySelector( 'iframe' );
	if ( iframe ) {
		iframe.src = 'about:blank';
	}
	iframeResizeObserver.disconnect();
	element.style.display = 'none';
}

domReady( () => {
	const blocks = document.querySelectorAll( '.wpbnbd' );
	const modalCheckout = document.querySelector( '.newspack-blocks-donate-checkout-modal' );
	const spinner = document.querySelector( '.newspack-blocks-donate-checkout-modal__spinner' );
	const iframeName = 'newspack_modal_checkout';
	let modalContent, modalCheckoutInput, iframe;
	if ( modalCheckout ) {
		modalCheckoutInput = document.createElement( 'input' );
		modalCheckoutInput.type = 'hidden';
		modalCheckoutInput.name = 'modal_checkout';
		modalCheckoutInput.value = '1';
		modalContent = modalCheckout.querySelector( '.newspack-blocks-donate-checkout-modal__content' );
		iframe = document.createElement( 'iframe' );
		iframe.name = iframeName;
		modalContent.appendChild( iframe );
	}
	blocks.forEach( block => {
		const forms = block.querySelectorAll( 'form' );
		forms.forEach( form => {
			if ( modalContent && iframe ) {
				form.appendChild( modalCheckoutInput.cloneNode() );
				form.target = iframeName;
				form.addEventListener( 'submit', () => {
					spinner.style.display = 'flex';
					modalCheckout.style.display = 'block';
					iframeResizeObserver = new ResizeObserver( entries => {
						if ( ! entries || ! entries.length ) {
							return;
						}
						const contentRect = entries[ 0 ].contentRect;
						if ( contentRect ) {
							modalContent.style.height = contentRect.top + contentRect.bottom + 'px';
						}
					} );
					iframe.addEventListener( 'load', () => {
						const location = iframe.contentWindow.location;
						// If RAS is available, set the front-end authentication.
						if (
							window.newspackReaderActivation &&
							location.href.indexOf( 'order-received' ) > -1
						) {
							const ras = window.newspackReaderActivation;
							const params = new Proxy( new URLSearchParams( location.search ), {
								get: ( searchParams, prop ) => searchParams.get( prop ),
							} );
							if ( params.email ) {
								ras.setReaderEmail( params.email );
								ras.setAuthenticated( true );
							}
						}
						iframeResizeObserver.observe(
							iframe.contentWindow.document.body.querySelector( '.woocommerce' )
						);
						spinner.style.display = 'none';
					} );
				} );
			} else {
				// Unable to use modal checkout, so submit the form normally.
				form.target = '_top';
				if ( modalCheckoutInput ) {
					form.removeChild( modalCheckoutInput );
				}
			}
		} );
	} );
	if ( modalCheckout ) {
		modalCheckout.addEventListener( 'click', ev => {
			if ( ev.target === modalCheckout ) {
				closeCheckout( modalCheckout );
			}
		} );
		const closeButtons = modalCheckout.querySelectorAll(
			'.newspack-blocks-donate-checkout-modal__close'
		);
		closeButtons.forEach( button => {
			button.addEventListener( 'click', ev => {
				ev.preventDefault();
				closeCheckout( modalCheckout );
			} );
		} );
	}
} );
