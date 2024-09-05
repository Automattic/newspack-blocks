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

	let action = 'opened';

	const {
		action_type,
		amount = '',
		currency,
		is_variable = '',
		price = '',
		product_id,
		product_type,
		recurrence,
		referrer,
		variation_id = '',
	} = getProductDataModal;

	const params = {
		action_type,
		currency,
		product_id,
		product_type,
		recurrence,
		referrer,
	};

	// On the first variable screen, there may not be a price so we want to check for it.
	if ( amount || price ) {
		params.amount = amount ? amount : price;
	}

	// There's only a variation ID for variable products, after you've selected one.
	if ( variation_id ) {
		params.variation_id = variation_id;
		action = 'opened_variation'; // Change the action to reflect it's coming from inside the variation picker modal.
	}

	if ( is_variable ) {
		params.is_variable = is_variable;
	}

	const payload = getEventPayload( action, params );

	sendEvent( payload );
};
