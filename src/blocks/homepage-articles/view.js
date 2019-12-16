/**
 * VIEW
 * JavaScript used on front of site.
 */

/**
 * Style dependencies
 */
import './view.scss';

const config = {
	blockSelector: '[data-wp-block-newspack-blocks-homepage-articles]',
	postsSelector: '[data-posts]',
	postSelector: `[data-post-id]`,
	buttonSelector: '[data-next]',
	loadingSelector: '[data-loading]',
	errorSelector: '[data-error]',
	postIdAttribute: 'data-post-id',
	nextUrlAttribute: 'data-next',
	excludeIdsParamName: 'exclude_ids',
	fetchRetryCount: 3,
};

/**
 * Load More Button Handling
 */

getBlockEl( config.buttonSelector ).forEach( attachLoadMoreHandler );

/**
 * Attaches an event handler to the Load more button.
 * @param {DOMElement} btnEl the button that was clicked
 */
function attachLoadMoreHandler( btnEl ) {
	if ( ! btnEl ) {
		return null;
	}

	const handler = buildLoadMoreHandler( btnEl );

	btnEl.addEventListener( 'click', handler );
}

/**
 * Builds a function to handle clicks on the load more button.
 * Creates internal state via closure to ensure all state is
 * isolated to a single Block + button instance.
 *
 * @param {DOMElement} btnEl the button that was clicked
 */
function buildLoadMoreHandler( btnEl ) {
	// Set elements from scope determined by the clicked "Load more" button.
	const blockEl = btnEl.parentElement;
	const postsEl = getBlockEl( config.postsSelector, blockEl );
	const loadingEl = getBlockEl( config.loadingSelector, blockEl );
	const errorEl = getBlockEl( config.errorSelector, blockEl );

	// Set initial state flags.
	let isFetching = false;
	let isEndOfData = false;

	return () => {
		// Early return if still fetching or no more posts to render.
		if ( isFetching || isEndOfData ) {
			return false;
		}

		isFetching = true;

		// Set elements visibility for fetching state.
		hideEl( btnEl );
		hideEl( errorEl );
		showEl( loadingEl );

		const requestURL = new URL( btnEl.getAttribute( config.nextUrlAttribute ) );

		// Set currenty rendered posts' IDs as a query param (e.g. exclude_ids=1,2,3)
		requestURL.searchParams.set( config.excludeIdsParamName, getRenderedPostsIds().join( ',' ) );

		fetchWithRetry( { url: requestURL.toString(), onSuccess, onError }, config.fetchRetryCount );

		function onSuccess( data ) {
			// Validate received data.
			if ( ! isPostsDataValid( data ) ) {
				return onError();
			}

			if ( data.items.length ) {
				// Render posts' HTML from string.
				const postsHTML = data.items.map( item => item.html ).join( '' );
				postsEl.insertAdjacentHTML( 'beforeend', postsHTML );
			}

			if ( data.next ) {
				// Save next URL as button's attribute.
				btnEl.setAttribute( config.nextUrlAttribute, data.next );

				// Unhide button since there are more posts available.
				showEl( btnEl );
			}

			if ( ! data.items.length || ! data.next ) {
				isEndOfData = true;
			}

			isFetching = false;

			hideEl( loadingEl );
		}

		function onError() {
			isFetching = false;

			// Display error message and keep the button visible to enable retrying.
			hideEl( loadingEl );
			showEl( errorEl );
			showEl( btnEl );
		}
	};
}

/**
 * Returns unique IDs for posts that are currently in the DOM.
 */
function getRenderedPostsIds() {
	const postEls = getBlockEl( config.postSelector );
	const postIds = Array.from( postEls ).map( el => el.getAttribute( config.postIdAttribute ) );

	return [ ...new Set( postIds ) ]; // Make values unique with Set
}

/**
 * Wrapper for XMLHttpRequest that performs given number of retries when error
 * occurs.
 *
 * @param {Object} options XMLHttpRequest options
 * @param {Number} n retry count before throwing
 */
function fetchWithRetry( options, n ) {
	const xhr = new XMLHttpRequest();

	xhr.onreadystatechange = () => {
		// Return if the request is completed.
		if ( xhr.readyState !== 4 ) {
			return;
		}

		// Call onSuccess with parsed JSON if the request is successful.
		if ( xhr.status >= 200 && xhr.status < 300 ) {
			const data = JSON.parse( xhr.responseText );

			return options.onSuccess( data );
		}

		// Call onError if the request has failed n + 1 times (or if n is undefined).
		if ( ! n ) {
			return options.onError();
		}

		// Retry fetching if request has failed and n > 0.
		return fetchWithRetry( options, n - 1 );
	};

	xhr.open( 'GET', options.url );
	xhr.send();
}

/**
 * Validates the "Load more" posts endpoint schema:
 * {
 * 	"type": "object",
 * 	"properties": {
 * 		"items": {
 * 			"type": "array",
 * 			"items": {
 * 				"type": "object",
 * 				"properties": {
 * 					"html": {
 * 						"type": "string"
 * 					}
 * 				},
 * 				"required": ["html"]
 * 			},
 * 			"required": ["items"]
 * 		},
 * 		"next": {
 * 			"type": ["string", "null"]
 * 		}
 * 	},
 * 	"required": ["items", "next"]
 * }
 *
 * @param {Object} data posts endpoint payload
 */
function isPostsDataValid( data ) {
	let isValid = false;

	if (
		data &&
		hasOwnProp( data, 'items' ) &&
		Array.isArray( data.items ) &&
		hasOwnProp( data, 'next' ) &&
		typeof data.next === 'string'
	) {
		isValid = true;

		if (
			data.items.length &&
			! ( hasOwnProp( data.items[ 0 ], 'html' ) && typeof data.items[ 0 ].html === 'string' )
		) {
			isValid = false;
		}
	}

	return isValid;
}

/**
 * Get DOM elements from the Homepage Articles block scope. Returns elements
 * from all HA blocks if parentBlock is not specified.
 *
 * @param {string} childSelector Selector of block's child element
 * @param {Element} [parentBlock] Parent block of queried child element
 * @returns {Element|Element[]} Element(s) from the block scope
 */
function getBlockEl( childSelector, parentBlock ) {
	const { blockSelector } = config;

	if ( parentBlock ) {
		// Check if it's a valid Homepage Articles block
		if ( parentBlock.hasAttribute( blockSelector.replace( /\[|\]/g, '' ) ) ) {
			return parentBlock.querySelector( childSelector );
		}

		return null;
	}

	return document.querySelectorAll( blockSelector + ' ' + childSelector );
}

/**
 * Hides given DOM element.
 *
 * @param {DOMElement} el
 */
function hideEl( el ) {
	el.style.display = 'none';
	el.setAttribute( 'hidden', '' );
}

/**
 * Unhides given DOM element.
 *
 * @param {DOMElement} el
 */
function showEl( el ) {
	el.style.display = '';
	el.removeAttribute( 'hidden' );
}

/**
 * Checks if object has own property.
 *
 * @param {Object} obj
 * @param {String} prop
 */
function hasOwnProp( obj, prop ) {
	return Object.prototype.hasOwnProperty.call( obj, prop );
}
