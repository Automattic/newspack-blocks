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

let iframeRo;

function closeCheckout( element ) {
	const iframe = element.querySelector( 'iframe' );
	if ( iframe ) {
		iframe.src = 'about:blank';
	}
	iframeRo.disconnect();
	element.style.display = 'none';
}

domReady( () => {
	const blocks = document.querySelectorAll( '.wpbnbd' );
	const modalCheckout = document.querySelector( '.newspack-blocks-donate-checkout-modal' );
	const spinner = document.querySelector( '.newspack-blocks-donate-checkout-modal__spinner' );
	blocks.forEach( block => {
		const forms = block.querySelectorAll( 'form' );
		forms.forEach( form => {
			const modalCheckoutInput = form.querySelector( 'form input[name="modal_checkout"]' );
			const isModalCheckout = modalCheckoutInput && modalCheckoutInput.value === '1';
			if ( isModalCheckout && modalCheckout ) {
				form.addEventListener( 'submit', () => {
					spinner.style.display = 'flex';
					const modalContent = modalCheckout.querySelector(
						'.newspack-blocks-donate-checkout-modal__content'
					);
					const iframe = modalCheckout.querySelector( 'iframe' );
					iframeRo = new ResizeObserver( entries => {
						if ( ! entries || ! entries.length ) {
							return;
						}
						const contentRect = entries[ 0 ].contentRect;
						if ( contentRect ) {
							modalContent.style.height = contentRect.height + 'px';
						}
					} );
					modalCheckout.style.display = 'block';
					iframe.addEventListener( 'load', () => {
						// Wait a bit for the iframe to load.
						iframeRo.observe( iframe.contentWindow.document.body.querySelector( '.woocommerce' ) );
						spinner.style.display = 'none';
					} );
				} );
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
