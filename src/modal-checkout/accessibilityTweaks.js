/**
 * Trap focus in the modal when opened.
 * See: https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
 *
 * @param {string} currentModal Name of area to trap focus.
 */
export function trapFocus( currentModal ) {
	const focusableEls =
		'button, [href], input:not([type="hidden"]), iframe, select, textarea, [tabindex]:not([tabindex="-1"])';

	const focusableElsAll = currentModal.querySelectorAll( focusableEls );
	let firstFocusableEl = currentModal.querySelectorAll( focusableEls )[ 0 ]; // get first element to be focused inside modal
	const lastFocusableEl = focusableElsAll[ focusableElsAll.length - 1 ]; // get last element to be focused inside modal

	// Check if in an iframe, and if yes, reset the last focusable element as inside of the whole modal.
	// TODO: improve this for shift-tab - it gives the iframe focus first, not the last element inside.
	const iframe = window.frameElement;
	if ( iframe ) {
		const modalContainer = iframe.closest( '[role="dialog"]' );
		firstFocusableEl = modalContainer.querySelectorAll( focusableEls )[ 0 ]; // update first element to be inside modal
	}

	document.addEventListener( 'keydown', function ( e ) {
		const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

		if ( ! isTabPressed ) {
			return;
		}

		/* eslint-disable @wordpress/no-global-active-element */
		if ( e.shiftKey ) {
			if ( document.activeElement === firstFocusableEl ) {
				lastFocusableEl.focus();
				e.preventDefault();
			}
		} else if ( document.activeElement === lastFocusableEl ) {
			firstFocusableEl.focus();
			e.preventDefault();
		}
		/* eslint-enable @wordpress/no-global-active-element */
	} );
	firstFocusableEl.focus();
}
