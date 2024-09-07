import { getEventPayload, getProductDetails, sendEvent } from './utils';

/**
 * Event fired when a checkout modal is dismissed (not when closed automatically due to a completed checkout).
 */
export const manageDismissed = () => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	const { action_type, amount = '', currency, price = '', product_id, product_type, recurrence, referrer, variation_id = '' } = getProductDetails( 'newspack_modal_checkout' );

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
	}

	const payload = getEventPayload( 'dismissed', params );
	sendEvent( payload );
};
