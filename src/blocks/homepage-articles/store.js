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
	queryApiResponses: {}, // cache of resolved queries
	blockQueryResponses: {}, // map of blockIds -> queryApiResponses
};

const UPDATE_CRITERIA = 'UPDATE_CRITERIA';
const REQUEST_POSTS = 'REQUEST_POSTS';
const RECEIVE_POSTS = 'RECEIVE_POSTS';
const UPDATE_BLOCKS = 'UPDATE_BLOCKS';
const CLEAR_POSTS = 'CLEAR_POSTS';
const DEDUPLICATE_POSTS = 'DEDUPLICATE_POSTS';
const CACHE_RESPONSE = 'CACHE_RESPONSE';

const actions = {
	updateCriteria( clientId, criteria, postIdsToExclude ) {
		return {
			type: UPDATE_CRITERIA,
			clientId,
			criteria,
			postIdsToExclude,
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
	deDuplicatePosts() {
		return { type: DEDUPLICATE_POSTS };
	},
	cacheResponse( clientId, criteria, postIdsToSkip, posts ) {
		return {
			type: CACHE_RESPONSE,
			clientId,
			criteria,
			postIdsToSkip,
			posts,
		};
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

/**
 * Turns a query into an index for queryApiResponses
 */
const serializeCriteria = ( criteria, postIdsToSkip ) =>
	JSON.stringify( [ criteria, postIdsToSkip ] );

const selectors = {
	query( state, clientId, criteria, postIdsToSkip = [] ) {
		console.log( 'SELECTOR: ', clientId, criteria, postIdsToSkip );
		// return state.deDuplicatedPostsByBlock[ clientId ];
		return state.queryApiResponses[ serializeCriteria( criteria, postIdsToSkip ) ] || [];
	},
	allQueryBlocksOnPage( state ) {
		return state.queryBlocks;
	},
	pendingRequestsForEarlierBlocks( state, clientId ) {
		return blocksBefore( state.queryBlocks, clientId )
			.map( b => b.clientId )
			.map( bId => state.pendingRequestsByBlock[ bId ] )
			.filter( r => r ); // remove missing
	},
	previousPostIds( state, clientId ) {
		return blocksBefore( state.queryBlocks, clientId )
			.map( b => b.clientId )
			.flatMap( clientId => ( state.deDuplicatedPostsByBlock[ clientId ] || [] ).map( p => p.id ) );
	},
};

// resolvers must yield an action that contains a promise we want to wait for
const resolvers = {
	*query( clientId, criteria, postIdsToSkip = [] ) {
		console.log( 'RESOLVER: ', clientId, criteria, postIdsToSkip );
		let postFetch;

		// Resolve specific mode queries immediately
		const specificMode = !! criteria.include;
		const prevPromises = specificMode
			? []
			: select( STORE_NAMESPACE ).pendingRequestsForEarlierBlocks( clientId );

		// Why do I need to wait if I'm going to just do the exclude later?
		// TODO simplify!
		postFetch = Promise.all( prevPromises ).then( () => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/posts', {
					...criteria,
					// per_page: criteria.per_page + ( postIdsToSkip.length || 0 ),
					exclude: postIdsToSkip.join( ',' ),
					context: 'edit',
				} ),
			} );
		} );

		dispatch( STORE_NAMESPACE ).requestPosts( clientId, postFetch );
		const posts = yield actions.requestPosts( clientId, postFetch );
		dispatch( STORE_NAMESPACE ).cacheResponse( clientId, criteria, postIdsToSkip, posts );
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

		if ( ! criteria[ clientId ] ) {
			return deDuplicatedPostsByBlock;
		}

		const { include, per_page } = criteria[ clientId ];
		const rawPosts = postsByBlock[ clientId ] || [];
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
			const updateCriteriaCacheKey = serializeCriteria( action.criteria, action.postIdsToExclude );
			return {
				...state,
				criteria: {
					...state.criteria,
					[ action.clientId ]: action.criteria,
				},
				blockQueryResponses: {
					...state.blockQueryResponses,
					[ action.clientId ]: updateCriteriaCacheKey,
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
		case DEDUPLICATE_POSTS:
			const deduplicatePostsState = {
				...state,
				deDuplicatedPostsByBlock: deDuplicatePosts( state ),
			};
			return deduplicatePostsState;
		case CACHE_RESPONSE:
			const cacheKey = serializeCriteria( action.criteria, action.postIdsToSkip );
			const cacheResponseState = {
				...state,
				blockQueryResponses: { ...state.blockQueryResponses, [ action.clientId ]: cacheKey },
				queryApiResponses: { ...state.queryApiResponses, [ cacheKey ]: action.posts },
			};
			return cacheResponseState;
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
	const { allQueryBlocksOnPage, query, previousPostIds } = select( STORE_NAMESPACE );
	const { updateBlocks, updateCriteria } = dispatch( STORE_NAMESPACE );

	let currentBlocksIds;
	subscribe( () => {
		const newBlocksIds = getClientIdsWithDescendants();
		// I don't know why != works but it does, I guess getClientIdsWithDescendants is memoized?
		const blocksChanged = newBlocksIds != currentBlocksIds;
		currentBlocksIds = newBlocksIds;

		if ( blocksChanged ) {
			updateBlocks( getBlocks() );
			allQueryBlocksOnPage().forEach( block => {
				const postIdsToExclude = previousPostIds( block.clientId );
				const criteria = queryCriteriaFromAttributes( block.attributes );
				updateCriteria( block.clientId, criteria, postIdsToExclude );
				query( block.clientId, criteria, postIdsToExclude );
			} );
		}
	} );
};
