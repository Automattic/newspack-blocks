import { getEventPayload, sendEvent } from './utils';

/**
 * Event fired when the modal checkout content is loaded.
 */
export const manageLoaded = () => {
	if ( 'function' !== typeof gtag ) {
		return;
	}
	const payload = getEventPayload( 'loaded' );
	sendEvent( payload );
};
