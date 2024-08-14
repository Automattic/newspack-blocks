// TODOGA4: track when a modal open attempt is triggered by a checkout button, donate button

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

	const {
		action_type,
		amount,
		currency,
		is_variable,
		variation_id,
		product_id,
		price,
		recurrence,
		referer
	} = getProductDataModal;

	// TODOGA4: why are there a price and an amount? How to deduplicate??
	// Also, what to do with the variable ones? Should they be skipped entirely, or just empty if empty?

	const payload = getEventPayload( 'opened', {
		action_type,
		amount: amount ? amount : price, // Checkout uses price; Donate uses amount.
		currency,
		product_id,
		recurrence,
		referer,
		is_variable: is_variable ? is_variable : '',
		variation_id: variation_id ? variation_id : '',
	} );

	sendEvent( payload );
};
