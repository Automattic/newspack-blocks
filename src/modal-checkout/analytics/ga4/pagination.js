import { getEventPayload, sendEvent } from './utils';

/**
 * Event fired when switching between steps of the multi-step checkout flow.
 *
 * @param {string} action Action name for the event: 'continue' or 'back'.
 */

export const managePagination = ( action = 'continue' ) => {
	if ( 'function' !== typeof gtag ) {
		return;
	}
	const payload = getEventPayload( action );
	sendEvent( payload );
};
