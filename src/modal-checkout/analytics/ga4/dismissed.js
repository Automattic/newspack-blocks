import { getEventPayload, getProductDetails, sendEvent } from './utils';

/**
 * Event fired when a checkout modal is dismissed (not when closed automatically due to a completed checkout).
 */
export const manageDismissed = ( captureProductDataFromModal ) => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	// TODO: this works but is clunky:
	const { action_type, currency, price, product_id, recurrence, referer } = captureProductDataFromModal;
	const payload = getEventPayload( 'dismissed', {
		action_type,
		amount: price,
		currency,
		product_id,
		recurrence,
		referer,
	} );
	sendEvent( payload );
};
