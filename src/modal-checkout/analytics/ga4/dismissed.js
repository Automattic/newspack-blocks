import { getEventPayload, sendEvent } from './utils';

/**
 * Event fired when a checkout modal is dismissed (not when closed automatically due to a completed checkout).
 */
export const manageDismissed = captureProductDataFromModal => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	// TODOGA4: this works but is clunky:
	const { action_type, amount, currency, price, product_id, recurrence, referer } = captureProductDataFromModal;
	const payload = getEventPayload( 'dismissed', {
		action_type,
		amount: amount ? amount : price, // Checkout uses price; Donate uses amount.
		currency,
		product_id,
		recurrence,
		referer,
	} );
	sendEvent( payload );
};
