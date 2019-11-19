import apiFetch from '@wordpress/api-fetch';
import { registerStore, select, subscribe, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { sum } from 'lodash';

const initialState = {
	queryBlocks: [],              // list of Query blocks in the order they are on the page
	criteria: {},                 // map of Query criteria to block clientId
	postsByBlock: {},             // map of returned posts to block clientId
	deDuplicatedPostsByBlock: {}, // map of processed posts to block clientId
	pendingRequestsByBlock: {},   // map to keep track of outstanding fetch requests
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
	requestPosts( clientId, postsRequest ) {
		return {
			type: REQUEST_POSTS,
			clientId,
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

/**
 * Returns the Query blocks that appear before the current one on the page
 *
 * @param {Block[]} orderedBlocks
 * @param {uuid} clientId
 * @returns {Block[]}
 */
const blocksBefore = ( orderedBlocks, clientId ) => {
	const ourBlockIdx = orderedBlocks.findIndex( b => b.clientId == clientId );
	return orderedBlocks.slice( 0, ourBlockIdx );
}

const selectors = {
	query( state, clientId, criteria ) {
		return state.deDuplicatedPostsByBlock[ clientId ] || [];
	},
	countPostsInEarlierBlocks( state, clientId ) {
		const { queryBlocks, deDuplicatedPostsByBlock } = state;
		const earlierBlocks = blocksBefore( queryBlocks, clientId );
		return sum( earlierBlocks.map( b => {
			if ( deDuplicatedPostsByBlock[ b.clientId ] ) {
				return deDuplicatedPostsByBlock[ b.clientId ].length
			}
			return 0;
		} ) );
	},
	pendingRequestsForEarlierBlocks( state, clientId ) {
		return blocksBefore( state.queryBlocks, clientId )
			.map( b => b.clientId )
			.map( bId => state.pendingRequestsByBlock[ bId ] )
			.filter( r => r ) // remove missing
	}
}

// resolvers must yield an action that contains a promise we want to wait for
const resolvers = {
	* query( clientId, criteria ) {
		let postFetch;
		const prevPromises = select( 'newspack-blocks/query' ).pendingRequestsForEarlierBlocks( clientId ) ;

		if ( criteria.singleMode && ! isNaN( criteria.singleId ) ) {
			postFetch = Promise.all( prevPromises )
				.then( () => apiFetch( {
					path: `/wp/v2/posts/${ criteria.singleId }?context=edit`
				} ) )
				.then( singlePost => [ singlePost ] );
		} else {
			// Wait for any other posts to display so we can correctly count earlier blocks
			postFetch = Promise.all( prevPromises ).then( () => {
				const earlierBlockCount = select( 'newspack-blocks/query' ).countPostsInEarlierBlocks( clientId );
				const queryParams = {
					...criteria,
					per_page: 0 + criteria.per_page + earlierBlockCount
				}

				return apiFetch( {
					path: addQueryArgs( '/wp/v2/posts', { ...queryParams, context: 'edit' } )
				} );
			} )
		}

		dispatch( 'newspack-blocks/query' ).requestPosts( clientId, postFetch )
		const posts = yield actions.requestPosts( clientId, postFetch );
		return actions.receivePosts( clientId, posts );
	}
}

// controls must match the action type and return a promise for a value that
// will be returned to the resolver's yield
const controls = {
	REQUEST_POSTS( action ) {
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
	const { queryBlocks, postsByBlock, criteria } = state;

	return queryBlocks.reduce( ( deDuplicatedPostsByBlock , block ) => {
		const { clientId } = block;
		const rawPosts = postsByBlock[ clientId ] || [];

		if ( ! criteria[ clientId ] ) {
			return [];
		}

		const { singleMode, per_page } = criteria[ clientId ];

		// Force a single post not to de-duplicate
		if ( singleMode && rawPosts.length ) {
			const singlePost = rawPosts[0];
			seenPostIds.add( singlePost.id );
			return {
				...deDuplicatedPostsByBlock,
				[ clientId ]: [ singlePost ]
			}
		}

		let remainingPostCount = per_page;

		deDuplicatedPostsByBlock[ clientId ] = rawPosts.filter( post => {
			if ( ! remainingPostCount ) {
				return false;
			}

			if ( seenPostIds.has( post.id ) ) {
				return false
			}

			remainingPostCount--;
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
		case REQUEST_POSTS:
			return {
				...state,
				pendingRequestsByBlock: {
					...state.pendingRequestsByBlock,
					[ action.clientId ]: action.postsRequest,
				},
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
