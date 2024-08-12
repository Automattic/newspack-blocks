// TODO: track when a modal open attempt is triggered by a checkout button, donate button

import { getEventPayload, sendEvent } from './utils';

/**
 * Execute a callback function to send a GA event when a prompt is dismissed.
 *
 * @param {object} getProductDataModal Information about the purchase being made.
 */
export const manageOpened = ( getProductDataModal = '' ) => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	const { action_type, currency, is_variable, variation_id, product_id, price, recurrence, referer } = getProductDataModal;

	const payload = getEventPayload( 'opened', {
		action_type,
		amount: price,
		currency,
		product_id,
		recurrence,
		referer,
		is_variable,
		variation_id,
	} );

	sendEvent( payload );
};
