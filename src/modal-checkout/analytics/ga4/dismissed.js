import { getEventPayload, sendEvent } from './utils';

/**
 * Event fired when a checkout modal is dismissed (not when closed automatically due to a completed checkout).
 */

export const manageDismissed = () => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}
	const extraParams = {};
	const payload = getEventPayload( 'dismissed', extraParams );
	sendEvent( payload );
};
