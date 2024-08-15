import { getEventPayload, getProductDetails, sendEvent } from './utils';

/**
 * Event fired when switching between steps of the multi-step checkout flow.
 *
 * @param {string} action Action name for the event: 'continue' or 'back'.
 */

export const managePagination = ( action = 'continue' ) => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	const { action_type, amount, currency, product_id, product_type, recurrence, referer } = getProductDetails( 'modal-checkout-product-details' );
	const payload = getEventPayload( action, {
		action_type,
		amount,
		currency,
		product_id,
		product_type,
		recurrence,
		referer,
	} );
	sendEvent( payload );
};
