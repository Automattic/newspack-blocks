import { getEventPayload, sendEvent } from './utils';
import { domReady } from '../../utils';

/**
 * Event fired when the modal checkout content is loaded.
 */
export const manageLoaded = () => {
	domReady( function() {
		if ( 'function' !== typeof window.gtag ) {
			return;
		}

		/**
		 * TODO: This needs to be it's own function to be used by the pagination & dismissed events, too.
		 */
		const productDetailsContainer = document.getElementById( 'modal-checkout-product-details' );
		const productDetails = JSON.parse( productDetailsContainer.getAttribute( 'data-order-details' ) );

		// I don't know how to get all this stuff together nicely, so doing it poorly for now:
		const payload = getEventPayload( 'loaded', {
			action_type: productDetails['action_type'],
			product_id: productDetails['product_id'],
			amount: productDetails['amount'],
			currency: productDetails['currency'],
			referer: productDetails['referer'],
			recurrence: productDetails['recurrence'],
		} );

		sendEvent( payload );
	} );
};
