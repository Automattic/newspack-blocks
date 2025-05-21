/**
 * Specify a function to execute when the DOM is fully loaded.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/packages/dom-ready/
 *
 * @param {Function} callback A function to execute after the DOM is ready.
 * @return {void}
 */
export function domReady( callback ) {
	if ( typeof document === 'undefined' || typeof callback !== 'function' ) {
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

/**
 * Create a hidden input field.
 *
 * @param {string} name  The name of the input field.
 * @param {string} value The value of the input field. Optional.
 *
 * @return {HTMLInputElement} The hidden input element.
 */
export function createHiddenInput( name, value = null ) {
	const input = document.createElement( 'input' );
	input.type = 'hidden';
	input.name = name;

	// Set the value if provided.
	if ( value ) {
		input.value = value;
	}

	return input;
}

/**
 * Run a callback when an iframe is ready.
 *
 * @param {HTMLIFrameElement} iframe The iframe element.
 * @param {Function}          cb     The callback to execute when the iframe is ready.
 *
 * @return {void}
 */
export function iframeReady( iframe, cb ) {
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
 * Trigger a form submit.
 *
 * @param {HTMLFormElement} form The form element.
 *
 * @return {void}
 */
export function triggerFormSubmit( form ) {
	// form.submit does not trigger submit event listener, so we use requestSubmit.
	form.requestSubmit( form.querySelector( 'button[type="submit"]' ) );
}

/**
 * Get details from the data-order-details attribute given an element Node or ID.
 *
 * @param {HTMLElement|string} element HTML element or its ID to get order details from.
 *
 * @return {Object} Order details.
 */
export function getOrderDetails( element ) {
	const container = typeof element === 'string' ? document.getElementById( element ) : element;
	if ( ! container ) {
		console.warn( 'No container found for order details' ); // eslint-disable-line no-console
		return {};
	}

	const json = container.getAttribute( 'data-order-details' );
	if ( ! json ) {
		console.warn( 'No order details found' ); // eslint-disable-line no-console
		return {};
	}

	let details = {};
	try {
		details = JSON.parse( json );
	} catch ( error ) {
		console.warn( 'Error parsing order details' ); // eslint-disable-line no-console
	}

	// Overwrite the action type with the value from the URL.
	const url = new URL( container.ownerDocument.defaultView.location.href );
	if ( url.searchParams.get( 'action_type' ) ) {
		details.action_type = url.searchParams.get( 'action_type' );
	}

	return details;
}
