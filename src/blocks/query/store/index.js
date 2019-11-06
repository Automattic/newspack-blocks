import apiFetch from '@wordpress/api-fetch';
import { registerStore, select, subscribe, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { sum } from 'lodash';

const initialState = {
	queryBlocks: [],              // list of Query blocks in the order they are on the page
	criteria: {},                 // map of Query criteria to block clientId
	postsByBlock: {},             // map of returned posts to block clientId
	deDuplicatedPostsByBlock: {}, // map of processed posts to block clientId
};

const UPDATE_CRITERIA = 'UPDATE_CRITERIA';
const REQUEST_POSTS = 'REQUEST_POSTS';
const RECIEVE_POSTS = 'RECIEVE_POSTS';
const UPDATE_BLOCKS = 'UPDATE_BLOCKS';

const actions = {
	updateCriteria( clientId, criteria ) {
		return {
			type: UPDATE_CRITERIA,
			clientId,
			criteria
		}
	},
	requestPosts( postsRequest ) {
		return {
			type: REQUEST_POSTS,
			postsRequest
		}
	},
	receivePosts( clientId, posts ) {
		return {
			type: RECIEVE_POSTS,
			clientId,
			posts
		}
	},
	updateBlocks( blocks ) {
		return {
			type: UPDATE_BLOCKS,
			blocks
		}
	},
}

const selectors = {
	query( state, clientId, criteria ) {
		return state.deDuplicatedPostsByBlock[ clientId ] || [];
	},
	countPostsInEarlierBlocks( state, clientId ) {
		const { queryBlocks, deDuplicatedPostsByBlock } = state;
		const ourBlockIdx = queryBlocks.findIndex( b => b.clientId == clientId );
		const earlierBlocks = queryBlocks.slice( 0, ourBlockIdx );
		return sum( earlierBlocks.map( b => deDuplicatedPostsByBlock[ b.clientId ].length ) );
	},
}

// resolvers must yield an action that contains a promise we want to wait for
const resolvers = {
	* query( clientId, criteria ) {
		const path = addQueryArgs( '/wp/v2/posts', {
			...criteria,
			context: 'edit'
		} );

		const postsFetch = apiFetch( { path } );
		const posts = yield actions.requestPosts( postsFetch );
		return actions.receivePosts( clientId, posts );
	}
}

// controls must match the action type and return a promise for a value that
// will be returned to the resolver's yield
const controls = {
	REQUEST_POSTS( action ) {
		// TODO track all requests and return Promise.all()?
		return action.postsRequest;
	}
}

/**
 * Returns an array of all newspack-blocks/query blocks in the order they are on
 * the page. This is needed to be able to show the editor blocks in the order
 * that PHP will render them.
 *
 * @param {Block[]} blocks
 * @return {Block[]}
 */
const getQueryBlocksInOrder = blocks => blocks.flatMap( block => {
	const queryBlocks = [];
	if ( block.name == "newspack-blocks/query" ) {
		queryBlocks.push( block );
	}
	return queryBlocks.concat( getQueryBlocksInOrder( block.innerBlocks ) );
} );

const deDuplicatePosts = ( state ) => {
	const seenPostIds = new Set();
	const { queryBlocks, postsByBlock } = state;

	return queryBlocks.reduce( ( deDuplicatedPostsByBlock , block ) => {
		const rawPosts = postsByBlock[ block.clientId ] || [];
		deDuplicatedPostsByBlock[ block.clientId ] = rawPosts.filter( post => {
			if ( seenPostIds.has( post.id ) ) {
				return false
			}
			seenPostIds.add( post.id );
			return true;
		} );
		return deDuplicatedPostsByBlock;
	}, {} );
}

const reducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case UPDATE_CRITERIA:
			return {
				...state,
				criteria: {
					...state.criteria,
					[ action.clientId ]: action.criteria
				}
			}

		case RECIEVE_POSTS:
			const newState = {
				...state,
				postsByBlock: {
					...state.postsByBlock,
					[ action.clientId ]: action.posts
				}
			}
			newState.deDuplicatedPostsByBlock = deDuplicatePosts( newState );
			return newState;
		case UPDATE_BLOCKS:
			return {
				...state,
				queryBlocks: getQueryBlocksInOrder( action.blocks )
			}
	}
	return state;
}

let currentBlocksIds;
subscribe( () => {
	const newBlocksIds = select( 'core/block-editor' ).getClientIdsWithDescendants();
	// I don't know why this works but it does, I guess getClientIdsWithDescendants is memoized?
	const hasNewBlocks = newBlocksIds != currentBlocksIds;
	currentBlocksIds = newBlocksIds;

	if ( hasNewBlocks ) {
		const newBlocks = select( 'core/block-editor' ).getBlocks();
		dispatch( 'newspack-blocks/query' ).updateBlocks( newBlocks );
	}
} );

const store = registerStore( 'newspack-blocks/query', {
	reducer,
	actions,
	selectors,
	resolvers,
	controls,
	initialState,
} );

export default store;
