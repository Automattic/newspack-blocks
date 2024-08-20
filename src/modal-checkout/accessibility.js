/**
 * Trap focus in the modal when opened.
 * See: https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
 */
export function trapFocus( currentModal, iframe = false ) {
	const focusableEls =
		'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
	const firstFocusableEl = currentModal.querySelectorAll( focusableEls )[ 0 ]; // get first element to be focused inside modal
	let lastFocusableEl; // Define last element to be focused on.

	firstFocusableEl.focus();

	// If iframe, we're in the checkout and need to handle the two-page checkout differently than normal modals:
	if ( iframe ) {
		document.addEventListener( 'keydown', function ( e ) {
			const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

			if ( ! isTabPressed ) {
				return;
			}

			/* eslint-disable @wordpress/no-global-active-element */
			if ( e.shiftKey ) {
				if ( document.activeElement === firstFocusableEl ) {
					const iframeBody = iframe.contentWindow.document,
						customerDetails = iframeBody.getElementById( 'customer_details' ), // Get billing page 1 wrapper.
						afterCustomerDetails = iframeBody.getElementById( 'after_customer_details' ), // Get billing page 2 wrapper.
						afterSuccess = iframeBody.getElementById( 'checkout-after-success' ); // Get after success button.

					// If the after success button is visible, make it the last element.
					if ( afterSuccess !== null ) {
						lastFocusableEl = afterSuccess;
					} else {
						/* eslint-disable no-lonely-if */
						if ( customerDetails.offsetParent !== null ) {
							// If the first billing screen is visible, make the Continue button the last element.
							lastFocusableEl = iframeBody.getElementById( 'checkout_continue' );
						} else if ( afterCustomerDetails.offsetParent !== null ) {
							// If the second billing screen is visible, make the Back button the last element.
							lastFocusableEl = iframeBody.getElementById( 'checkout_back' );
						}
						/* eslint-enable no-lonely-if */
					}

					lastFocusableEl.focus();
					e.preventDefault();
				}
			}
			/* eslint-enable @wordpress/no-global-active-element */
		} );

		// When the fake "last element" in the modal checkout has focus, move focus to the close button.
		document.getElementById( 'newspack-a11y-last-element' ).addEventListener( 'focus', () => {
			firstFocusableEl.focus();
		} );
	} else {
		const focusableElsAll = currentModal.querySelectorAll( focusableEls );
		lastFocusableEl = focusableElsAll[ focusableElsAll.length - 1 ]; // get last element to be focused inside modal

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
	}
}
