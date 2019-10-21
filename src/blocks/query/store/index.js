import { registerStore } from '@wordpress/data';

import { omit } from 'lodash';

const DEFAULT_STATE = {
	blocks: {},
};

const actions = {
	/**
	 * Log a post as displayed by a block
	 *
	 * @param {Number} id Post ID
	 * @param {String} clientId client ID for the Block that is displaying the post
	 */
	seePostId( id, clientId ) {
		return {
			type: 'SEE_POST',
			id,
			clientId
		}
	},
	clearSeenPostIds( clientId ) {
		return {
			type: 'CLEAR_SEEN_IDS',
			clientId
		}
	}
}

const selectors = {
	getOtherBlocksSeenPostIds( state, clientId ) {
		return Object.values( omit( state.blocks, clientId ) ).flat();
	},
}

const unique = ( arr ) => Array.from( new Set( arr ) )

const reducer = ( state = DEFAULT_STATE, action ) => {
	switch ( action.type ) {
		case 'SEE_POST':
			const newState = { ...state };
			if ( ! newState.blocks[ action.clientId ] ) {
				newState.blocks[ action.clientId ] = [];
			}
			return {
				...newState,
				blocks: {
					...newState.blocks,
					[ action.clientId ]: unique( [ ...newState.blocks[ action.clientId ], action.id ] ),
				}
			}
		case 'CLEAR_SEEN_IDS' :
			return {
				...state,
				blocks: {
					[ action.clientId ]: []
				}
			}
	}
	return state;
}

const store = registerStore( 'newspack-blocks/query', {
	reducer,
	actions,
	selectors,
	controls: {},
	resolvers: {}
} );

export default store;
