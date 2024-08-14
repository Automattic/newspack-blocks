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
		is_variable,
		variation_id,
		product_id,
		price,
		recurrence,
		referer,
	} = getProductDataModal;

	const extraParams = {
		action_type: is_variable ? 'variation_picker' : action_type, // switch action type for variaton picker? this can probably be moved.
		currency,
		product_id,
		recurrence,
		referer,
	};

	// This essentially amounts to a check whether is_variable; on that first step, there won't be a price to grab:
	if ( amount || price ) {
		extraParams.amount = amount ? amount : price;
	}

	if ( variation_id ) {
		extraParams.variation_id = variation_id;
	}

	const payload = getEventPayload( 'opened', extraParams );

	sendEvent( payload );
};
