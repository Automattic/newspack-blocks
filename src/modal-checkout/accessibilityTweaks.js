/**
 * Trap focus in the modal when opened.
 * See: https://uxdesign.cc/how-to-trap-focus-inside-modal-to-make-it-ada-compliant-6a50f9a70700
 */
export function trapFocus( currentModal, isIframe = false ) {
	const focusableEls =
		'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

	const firstFocusableEl = currentModal.querySelectorAll( focusableEls )[ 0 ]; // get first element to be focused inside modal
	let lastFocusableEl;

	firstFocusableEl.focus();

	document.addEventListener( 'keydown', function ( e ) {
		const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
		if ( ! isTabPressed ) {
			return;
		}

		if ( isIframe ) {
			// Get the iframe
			const iframe = document.getElementsByName( 'newspack_modal_checkout_iframe' )[ 0 ];

			if ( ! iframe ) {
				return;
			}

			const iframeBody = iframe.contentWindow.document;
			const customerDetails = iframeBody.getElementById( 'customer_details' );
			const afterCustomerDetails = iframeBody.getElementById( 'after_customer_details' );

			if ( e.shiftKey ) {
				if ( document.activeElement === firstFocusableEl ) {
					// If the first screen is visible, make the Continue button the last element.
					if ( customerDetails.offsetParent !== null ) {
						lastFocusableEl = iframeBody.getElementById( 'checkout_continue' );
						// If the second screen is visible, make the Back button the last element.
					} else if ( afterCustomerDetails !== null ) {
						lastFocusableEl = iframeBody.getElementById( 'checkout_back' );
					}

					lastFocusableEl.focus();
					e.preventDefault();
				}
			}
		} else {
			const focusableElsAll = currentModal.querySelectorAll( focusableEls );
			lastFocusableEl = focusableElsAll[ focusableElsAll.length - 1 ]; // get last element to be focused inside modal

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
		}
	} );

	if ( isIframe ) {
		// When the fake "last element" in the modal checkout has focus, move focus to the close button.
		document.getElementById( 'newspack-a11y-last-element' ).addEventListener( 'focus', () => {
			firstFocusableEl.focus();
		} );
	}
}
