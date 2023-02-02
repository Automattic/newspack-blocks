/**
 * Style dependencies
 */
import './view.scss';

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
	const form = document.querySelector( 'form' );
	if ( form ) {
		const modalCheckoutInput = document.createElement( 'input' );
		modalCheckoutInput.type = 'hidden';
		modalCheckoutInput.name = 'modal_checkout';
		modalCheckoutInput.value = '1';
		form.appendChild( modalCheckoutInput );
	}
} );
