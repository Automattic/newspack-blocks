// TODOGA4: track when a modal open attempt is triggered by a checkout button, donate button

import { getEventPayload, sendEvent } from './utils';

/**
 * Execute a callback function to send a GA event when a prompt is dismissed.
 *
 * @param {Object} getProductDataModal Information about the purchase being made.
 */
export const manageOpened = ( getProductDataModal = '' ) => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	const {
		action_type,
		amount,
		currency,
		variation_id,
		product_id,
		price,
		recurrence,
		referer,
	} = getProductDataModal;

	const extraParams = {
		action_type, // donation, product, subscription -- should we also track variations using is_variable?
		currency,
		product_id,
		recurrence,
		referer,
	};

	// On the first variable screen, there may not be a price so we want to check for it.
	if ( amount || price ) {
		extraParams.amount = amount ? amount : price;
	}

	// There's only a variation ID for variable products, after you've selected one.
	if ( variation_id ) {
		extraParams.variation_id = variation_id;
	}

	const payload = getEventPayload( 'opened', extraParams );

	sendEvent( payload );
};
