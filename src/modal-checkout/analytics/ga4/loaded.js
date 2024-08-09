import { getEventPayload, getProductDetails, sendEvent } from './utils';
import { domReady } from '../../utils';

/**
 * Event fired when the modal checkout content is loaded.
 */
export const manageLoaded = () => {
	domReady( function() {
		if ( 'function' !== typeof window.gtag ) {
			return;
		}

		const { action_type, amount, currency, product_id, recurrence, referer } = getProductDetails();
		const payload = getEventPayload( 'loaded', {
			action_type,
			amount,
			currency,
			product_id,
			recurrence,
			referer,
		} );

		sendEvent( payload );
	} );
};
