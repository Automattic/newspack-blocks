import apiFetch from '@wordpress/api-fetch';
import { registerStore, select, subscribe, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { sum } from 'lodash';

export const STORE_NAMESPACE = 'newspack-blocks/query';

const initialState = {
	queryBlocks: [],              // list of Query blocks in the order they are on the page
	criteria: {},                 // map of Query criteria to block clientId
	postsByBlock: {},             // map of returned posts to block clientId
	deDuplicatedPostsByBlock: {}, // map of processed posts to block clientId
	pendingRequestsByBlock: {},   // map to keep track of outstanding fetch requests
};

const UPDATE_CRITERIA = 'UPDATE_CRITERIA';
const REQUEST_POSTS = 'REQUEST_POSTS';
const RECEIVE_POSTS = 'RECEIVE_POSTS';
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
			type: RECEIVE_POSTS,
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
	allQueryBlocksOnPage( state ) {
		return state.queryBlocks;
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
		const prevPromises = select( STORE_NAMESPACE ).pendingRequestsForEarlierBlocks( clientId ) ;

		if ( criteria.singleMode && ! isNaN( criteria.singleId ) ) {
			postFetch = Promise.all( prevPromises )
				.then( () => apiFetch( {
					path: `/wp/v2/posts/${ criteria.singleId }?context=edit&_fields=id`
				} ) )
				.then( singlePost => [ singlePost ] );
		} else {
			// Wait for any other posts to display so we can correctly count earlier blocks
			postFetch = Promise.all( prevPromises ).then( () => {
				const earlierBlockCount = select( STORE_NAMESPACE ).countPostsInEarlierBlocks( clientId );
				const queryParams = {
					...criteria,
					per_page: 0 + criteria.per_page + earlierBlockCount
				}

				return apiFetch( {
					path: addQueryArgs( '/wp/v2/posts', { ...queryParams, context: 'edit', '_fields': 'id' } )
				} );
			} )
		}

		dispatch( STORE_NAMESPACE ).requestPosts( clientId, postFetch );
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
		if ( singleMode ) {
			let deDuplicatedPost = [];
			if ( rawPosts.length ) {
				const singlePost = rawPosts[0];
				seenPostIds.add( singlePost.id );
				deDuplicatedPost = [ singlePost ];
			}

			return {
				...deDuplicatedPostsByBlock,
				[ clientId ]: deDuplicatedPost
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
		case RECEIVE_POSTS:
			const receivePostsState = {
				...state,
				postsByBlock: {
					...state.postsByBlock,
					[ action.clientId ]: action.posts
				}
			}
			receivePostsState.deDuplicatedPostsByBlock = deDuplicatePosts( receivePostsState );
			return receivePostsState;
		case UPDATE_BLOCKS:
			const updateBlocksState = {
				...state,
				queryBlocks: getQueryBlocksInOrder( action.blocks )
			};
			return updateBlocksState;
	}
	return state;
}

let currentBlocksIds;
subscribe( () => {
	const newBlocksIds = select( 'core/block-editor' ).getClientIdsWithDescendants();
	// I don't know why this works but it does, I guess getClientIdsWithDescendants is memoized?
	const blocksChanged = newBlocksIds != currentBlocksIds;
	currentBlocksIds = newBlocksIds;

	if ( blocksChanged ) {
		const newBlocks = select( 'core/block-editor' ).getBlocks();
		dispatch( STORE_NAMESPACE ).updateBlocks( newBlocks );
		select( STORE_NAMESPACE ).allQueryBlocksOnPage().forEach( ( block, idx ) => {
			const { clientId, attributes } = block;
			const { criteria } = attributes;
			select( STORE_NAMESPACE ).query( clientId, { ...criteria, '_skip_memoization': clientId + idx } );
		} );
	}
} );

export const registerQueryStore = () => registerStore( STORE_NAMESPACE, {
	reducer,
	actions,
	selectors,
	resolvers,
	controls,
	initialState,
} );
