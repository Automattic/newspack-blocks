import { getEventPayload, getProductDetails, sendEvent } from './utils';

/**
 * Event fired when switching between steps of the multi-step checkout flow.
 *
 * @param {string} action Action name for the event: 'continue' or 'back'.
 */

export const manageCheckoutAttempt = () => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}

	const { action_type, amount, currency, product_id, recurrence, referer } = getProductDetails();
	const payload = getEventPayload( 'checkout_attempt', {
		action_type,
		amount,
		currency,
		product_id,
		recurrence,
		referer,
	} );
	sendEvent( payload );
};
