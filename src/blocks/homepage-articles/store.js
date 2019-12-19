import apiFetch from '@wordpress/api-fetch';
import { registerStore, select, subscribe, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { sum, omit } from 'lodash';

import metadata from './block.json';
import { queryCriteriaFromAttributes } from './edit';

const { name } = metadata;
export const STORE_NAMESPACE = name;
const blockName = `newspack-blocks/${ name }`;

const initialState = {
	queryBlocks: [], // list of Query blocks in the order they are on the page
	criteria: {}, // map of Query criteria to block clientId
	postsByBlock: {}, // map of returned posts to block clientId
	deDuplicatedPostsByBlock: {}, // map of processed posts to block clientId
	pendingRequestsByBlock: {}, // map to keep track of outstanding fetch requests
};

const UPDATE_CRITERIA = 'UPDATE_CRITERIA';
const REQUEST_POSTS = 'REQUEST_POSTS';
const RECEIVE_POSTS = 'RECEIVE_POSTS';
const UPDATE_BLOCKS = 'UPDATE_BLOCKS';
const CLEAR_POSTS = 'CLEAR_POSTS';

const actions = {
	updateCriteria( clientId, criteria ) {
		return {
			type: UPDATE_CRITERIA,
			clientId,
			criteria,
		};
	},
	requestPosts( clientId, postsRequest ) {
		return {
			type: REQUEST_POSTS,
			clientId,
			postsRequest,
		};
	},
	receivePosts( clientId, posts ) {
		return {
			type: RECEIVE_POSTS,
			clientId,
			posts,
		};
	},
	updateBlocks( blocks ) {
		return {
			type: UPDATE_BLOCKS,
			blocks,
		};
	},
	clearPosts( clientId ) {
		return { type: CLEAR_POSTS, clientId };
	},
};

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
};

const selectors = {
	query( state, clientId, criteria ) {
		return state.deDuplicatedPostsByBlock[ clientId ];
	},
	allQueryBlocksOnPage( state ) {
		return state.queryBlocks;
	},
	countPostsInEarlierBlocks( state, clientId ) {
		const { queryBlocks, deDuplicatedPostsByBlock } = state;
		const earlierBlocks = blocksBefore( queryBlocks, clientId );
		return sum(
			earlierBlocks.map( b => {
				if ( deDuplicatedPostsByBlock[ b.clientId ] ) {
					return deDuplicatedPostsByBlock[ b.clientId ].length;
				}
				return 0;
			} )
		);
	},
	pendingRequestsForEarlierBlocks( state, clientId ) {
		return blocksBefore( state.queryBlocks, clientId )
			.map( b => b.clientId )
			.map( bId => state.pendingRequestsByBlock[ bId ] )
			.filter( r => r ); // remove missing
	},
};

// resolvers must yield an action that contains a promise we want to wait for
const resolvers = {
	*query( clientId, criteria ) {
		let postFetch;

		// Resolve specific mode queries immediately
		const specificMode = !! criteria.include;
		const prevPromises = specificMode
			? []
			: select( STORE_NAMESPACE ).pendingRequestsForEarlierBlocks( clientId );

		postFetch = Promise.all( prevPromises ).then( () => {
			const earlierBlockCount = select( STORE_NAMESPACE ).countPostsInEarlierBlocks( clientId );
			const queryParams = {
				...criteria,
				per_page: criteria.per_page + earlierBlockCount,
			};

			return apiFetch( {
				path: addQueryArgs( '/wp/v2/posts', { ...queryParams, context: 'edit' } ),
			} );
		} );

		dispatch( STORE_NAMESPACE ).requestPosts( clientId, postFetch );
		const posts = yield actions.requestPosts( clientId, postFetch );
		return actions.receivePosts( clientId, posts );
	},
};

// controls must match the action type and return a promise for a value that
// will be returned to the resolver's yield
const controls = {
	REQUEST_POSTS( action ) {
		return action.postsRequest;
	},
};

/**
 * Returns an array of all newspack-blocks/query blocks in the order they are on
 * the page. This is needed to be able to show the editor blocks in the order
 * that PHP will render them.
 *
 * @param {Block[]} blocks
 * @return {Block[]}
 */
const getQueryBlocksInOrder = blocks =>
	blocks.flatMap( block => {
		const queryBlocks = [];
		if ( block.name == blockName ) {
			queryBlocks.push( block );
		}
		return queryBlocks.concat( getQueryBlocksInOrder( block.innerBlocks ) );
	} );

const deDuplicatePosts = state => {
	const seenPostIds = new Set();
	const { queryBlocks, postsByBlock, criteria } = state;

	return queryBlocks.reduce( ( deDuplicatedPostsByBlock, block ) => {
		const { clientId } = block;
		const rawPosts = postsByBlock[ clientId ] || [];

		if ( ! criteria[ clientId ] ) {
			return deDuplicatedPostsByBlock;
		}

		const { include, per_page } = criteria[ clientId ];

		const specificMode = include && include.length > 0;

		// Force a specific posts not to de-duplicate, but also log them to not show up in other queries
		if ( specificMode ) {
			rawPosts.forEach( p => seenPostIds.add( p.id ) );

			return {
				...deDuplicatedPostsByBlock,
				[ clientId ]: rawPosts,
			};
		}

		let remainingPostCount = parseInt( per_page );

		deDuplicatedPostsByBlock[ clientId ] = rawPosts.filter( post => {
			if ( ! remainingPostCount ) {
				return false;
			}

			if ( seenPostIds.has( post.id ) ) {
				return false;
			}

			remainingPostCount--;
			seenPostIds.add( post.id );
			return true;
		} );

		return deDuplicatedPostsByBlock;
	}, {} );
};

const reducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case UPDATE_CRITERIA:
			return {
				...state,
				criteria: {
					...state.criteria,
					[ action.clientId ]: action.criteria,
				},
			};
		case REQUEST_POSTS:
			return {
				...state,
				pendingRequestsByBlock: {
					...state.pendingRequestsByBlock,
					[ action.clientId ]: action.postsRequest,
				},
			};
		case RECEIVE_POSTS:
			const receivePostsState = {
				...state,
				postsByBlock: {
					...state.postsByBlock,
					[ action.clientId ]: action.posts,
				},
			};
			receivePostsState.deDuplicatedPostsByBlock = deDuplicatePosts( receivePostsState );
			return receivePostsState;
		case UPDATE_BLOCKS:
			const updateBlocksState = {
				...state,
				queryBlocks: getQueryBlocksInOrder( action.blocks ),
			};
			return updateBlocksState;
		case CLEAR_POSTS:
			const clearPostsState = {
				...state,
				deDuplicatedPostsByBlock: omit( state.deDuplicatedPostsByBlock, [ action.clientId ] ),
			};
			return clearPostsState;
	}
	return state;
};

export const registerQueryStore = () => {
	registerStore( STORE_NAMESPACE, {
		reducer,
		actions,
		selectors,
		resolvers,
		controls,
		initialState,
	} );

	const { getClientIdsWithDescendants, getBlocks } = select( 'core/block-editor' );
	const { allQueryBlocksOnPage, query } = select( STORE_NAMESPACE );
	const { updateBlocks, updateCriteria } = dispatch( STORE_NAMESPACE );

	let currentBlocksIds,
		cacheBust = 0;
	subscribe( () => {
		const newBlocksIds = getClientIdsWithDescendants();
		// I don't know why != works but it does, I guess getClientIdsWithDescendants is memoized?
		const blocksChanged = newBlocksIds != currentBlocksIds;
		currentBlocksIds = newBlocksIds;

		if ( blocksChanged ) {
			updateBlocks( getBlocks() );
			allQueryBlocksOnPage().forEach( block => {
				const criteria = queryCriteriaFromAttributes( block.attributes );
				updateCriteria( block.clientId, criteria );
				query( block.clientId, { ...criteria, _skip_memoization: block.clientId + cacheBust++ } );
			} );
		}
	} );
};
