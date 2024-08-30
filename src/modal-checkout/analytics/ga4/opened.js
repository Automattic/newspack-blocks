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
		price,
		product_id,
		product_type,
		recurrence,
		referer,
		variation_id,
	} = getProductDataModal;

	const params = {
		action_type,
		currency,
		product_id,
		product_type,
		recurrence,
		referer,
	};

	// On the first variable screen, there may not be a price so we want to check for it.
	if ( amount || price ) {
		params.amount = amount ? amount : price;
	}

	// There's only a variation ID for variable products, after you've selected one.
	if ( variation_id ) {
		params.variation_id = variation_id;
	}

	if ( is_variable ) {
		params.is_variable = is_variable;
	}

	const payload = getEventPayload( 'opened', params );

	sendEvent( payload );
};
