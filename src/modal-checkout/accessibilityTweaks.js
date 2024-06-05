/**
 * Trap focus in the modal when opened.
 * See: https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
 */
export function trapFocus( currentModal ) {
	const focusableEls =
		'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
	const firstFocusableEl = currentModal.querySelectorAll( focusableEls )[ 0 ]; // get first element to be focused inside modal
	const focusableElsAll = currentModal.querySelectorAll( focusableEls );
	const lastFocusableEl = focusableElsAll[ focusableEls.length - 1 ]; // get last element to be focused inside modal

	const checkoutBack = document.getElementById( 'checkout_back' );
	const checkoutContinue = document.getElementById( 'checkout_continue' );

	firstFocusableEl.focus();

	document.addEventListener( 'keydown', function ( e ) {
		const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

		if ( ! isTabPressed ) {
			return;
		}
		/* eslint-disable @wordpress/no-global-active-element */
		if ( e.shiftKey ) {
			if ( document.activeElement === firstFocusableEl ) {
				if ( checkoutContinue ) {
					checkoutContinue.focus();
					e.preventDefault();
				} else if ( checkoutBack ) {
					checkoutBack.focus();
					e.preventDefault();
				} else {
					lastFocusableEl.focus();
					e.preventDefault();
				}
			}
		} else if (
			document.activeElement === lastFocusableEl ||
			document.activeElement === checkoutBack ||
			document.activeElement === checkoutContinue
		) {
			firstFocusableEl.focus();
			e.preventDefault();
		}
		/* eslint-enable @wordpress/no-global-active-element */
	} );
}
