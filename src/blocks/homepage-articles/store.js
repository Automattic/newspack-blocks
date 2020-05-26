/**
 * External dependencies
 */
import { createStore, applyMiddleware, compose } from 'redux';
import { call, put, debounce } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';

/**
 * WordPress dependencies
 */
import { registerGenericStore, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { getBlockQueries } from './utils';

const { name } = metadata;
export const STORE_NAMESPACE = `newspack-blocks/${ name }`;

const initialState = {
	// Map of returned posts to block clientIds.
	postsByBlock: {},
};

// Generic redux action creators, not @wordpress/data actions.
const actions = {
	reflow: () => {
		reduxStore.dispatch( {
			type: 'REFLOW',
		} );
	},
};

// Generic redux selectors, not @wordpress/data selectors.
const selectors = {
	getPosts( { clientId } ) {
		const state = reduxStore.getState();
		return state.postsByBlock[ clientId ];
	},
	isUIDisabled() {
		const state = reduxStore.getState();
		return state.isUIDisabled;
	},
};

const reducer = ( state = initialState, action ) => {
	switch ( action.type ) {
		case 'DISABLE_UI':
			return {
				...state,
				isUIDisabled: true,
			};
		case 'ENABLE_UI':
			return {
				...state,
				isUIDisabled: false,
			};
		case 'UPDATE_BLOCK_POSTS':
			return {
				...state,
				postsByBlock: {
					...state.postsByBlock,
					[ action.clientId ]: action.posts,
				},
			};
	}
	return state;
};

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();
// mount it on the Store
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const reduxStore = createStore( reducer, composeEnhancers( applyMiddleware( sagaMiddleware ) ) );

const genericStore = {
	getSelectors() {
		return selectors;
	},
	getActions() {
		return actions;
	},
	...reduxStore,
};

/**
 * Get posts for a single block.
 *
 * @param {Object} block an object with a postsQuery and a clientId
 */
function* getPosts( block ) {
	// TODO: caching with block.postsQuery as key, a lot of these will be re-triggered, and the
	try {
		const path = addQueryArgs( '/wp/v2/posts', {
			...block.postsQuery,
			// `context=edit` is needed, so that custom REST fields are returned.
			context: 'edit',
		} );

		const posts = yield call( apiFetch, { path } );
		const postsIds = posts.map( post => post.id );
		// or maybe save used id in store
		yield put( { type: 'UPDATE_BLOCK_POSTS', clientId: block.clientId, posts } );
		return postsIds;
	} catch ( e ) {
		// TODO mark block as failed
		// yield put( { type: 'FETCH_FAILED', message: e.message } );
	}
}

/**
 * "worker" Saga: will be fired on REFLOW actions
 */
function* fetchPosts() {
	const { getBlocks } = select( 'core/block-editor' );

	yield put( { type: 'DISABLE_UI' } );

	const blockQueries = getBlockQueries( getBlocks() );

	// Use requested specific posts ids as the starting state of exclusion list.
	const specificPostsId = blockQueries.reduce( ( acc, { postsQuery } ) => {
		if ( postsQuery.include ) {
			acc = [ ...acc, ...postsQuery.include ];
		}
		return acc;
	}, [] );

	let exclude = specificPostsId;
	while ( blockQueries.length ) {
		const nextBlock = blockQueries.shift();
		nextBlock.postsQuery.exclude = exclude;
		const fetchedPostIds = yield call( getPosts, nextBlock );
		exclude = [ ...exclude, ...fetchedPostIds ];
	}

	yield put( { type: 'ENABLE_UI' } );
}

/**
 * Starts fetchPosts on each dispatched `REFLOW` action.
 *
 * Saga will be called after it stops taking REFLOW actions for 300 milliseconds.
 * Not using takeLatest to ensure that the saga will be *called once* per change,
 * not *cancelled* after a new reflow is triggered.
 */
function* fetchPostsSaga() {
	yield debounce( 300, 'REFLOW', fetchPosts );
}

// Run the saga ✨
sagaMiddleware.run( fetchPostsSaga );

export default () => {
	registerGenericStore( STORE_NAMESPACE, genericStore );
};
