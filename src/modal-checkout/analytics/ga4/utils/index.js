/**
 * Get a GA4 event payload for a given prompt.
 *
 * @param {string} action      Action name for the event.
 * @param {number} promptId    ID of the prompt
 * @param {Object} extraParams Additional key/value pairs to add as params to the event payload.
 *
 * @return {Object} Event payload.
 */

export const getEventPayload = ( action, extraParams = {} ) => {
	return { ...extraParams, action };
};

/**
 * Send an event to GA4.
 *
 * @param {Object} payload   Event payload.
 * @param {string} eventName Name of the event. Defaults to `np_modal_checkout_interaction` but can be overriden if necessary.
 */

export const sendEvent = ( payload, eventName = 'np_modal_checkout_interaction' ) => {
	if ( 'function' === typeof window.gtag && payload ) {
		console.log( eventName );
		console.log( payload );
		window.gtag( 'event', eventName, payload );
	}
};

/**
 * Get product details from the data-order-details attribute.
 *
 * @returns {Object} Product details.
 *                   action_type
 *                   amount
 *                   currency
 *                   product_id
 *                   recurrence
 *                   referer
 */
export const getProductDetails = () => {
	const productDetailsContainer = document.getElementById( 'modal-checkout-product-details' );
	const productDetailsJSON = productDetailsContainer ? productDetailsContainer.getAttribute( 'data-order-details' ) : false;
	const productDetails = productDetailsJSON ? JSON.parse( productDetailsJSON ) : false;
	return productDetails || {};
}
