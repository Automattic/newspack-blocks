// TODO: track when a modal open attempt is triggered by a checkout button, donate button

import { getEventPayload, sendEvent } from './utils';

/**
 * Execute a callback function to send a GA event when a prompt is dismissed.
 *
 * @param {string} blockType The type of block that triggered the open event: donate or checkout_button.
 */
export const manageOpened = ( blockType = 'donate' ) => {
	if ( 'function' !== typeof window.gtag ) {
		return;
	}
	const payload = getEventPayload( 'opened', {
		action_type: 'payment trigger whatever',
		block_type: blockType, // Or however we want to pass this data
	} );

	sendEvent( payload );
};
