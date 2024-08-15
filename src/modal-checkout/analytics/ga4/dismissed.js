import { getEventPayload, getProductDetails, sendEvent } from './utils';

/**
 * Event fired when a checkout modal is dismissed (not when closed automatically due to a completed checkout).
 */
export const manageDismissed = () => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	// TODOGA4: this works but is clunky:
	const { action_type, amount, currency, price, product_id, product_type, recurrence, referer } = getProductDetails( 'newspack_modal_checkout' );

	const extraParams = {
		action_type,
		currency,
		product_id,
		product_type,
		recurrence,
		referer,
	};

	// On the first variable screen, there may not be a price so we want to check for it.
	if ( amount || price ) {
		extraParams.amount = amount ? amount : price;
	}

	const payload = getEventPayload( 'dismissed', extraParams );
	sendEvent( payload );
};
