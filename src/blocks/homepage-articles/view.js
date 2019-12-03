/**
 * VIEW
 * JavaScript used on front of site.
 */

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Style dependencies
 */
import './view.scss';

const btnURLAttr = 'data-load-more-url';

/**
 * Load More Button Handling
 */
document.querySelectorAll( '[data-load-more-btn]' ).forEach( attachLoadMoreHandler );

/**
 * Attaches an event handler to the Load more button
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
	/**
	 * Set elements from scope determined by the clicked "Load more" button.
	 */
	const blockWrapperEl = btnEl.parentElement; // scope root element
	const postsContainerEl = blockWrapperEl.querySelector( '[data-posts-container]' );
	const loadingEl = blockWrapperEl.querySelector( '[data-load-more-loading-text]' );
	const errorEl = blockWrapperEl.querySelector( '[data-load-more-error-text]' );

	/**
	 * Set initial state flags
	 */
	let isFetching = false;
	let isEndOfData = false;

	return () => {
		/**
		 * Early return if still fetching or no more posts to render.
		 */
		if ( isFetching || isEndOfData ) {
			return false;
		}

		isFetching = true;

		/**
		 * Set elements visibility for fetching state.
		 */
		hideEl( btnEl );
		hideEl( errorEl );
		showEl( loadingEl );

		apiFetch( { url: btnEl.getAttribute( btnURLAttr ) } )
			.then( data => {
				/**
				 * Validate received data
				 */
				if ( ! isPostsDataValid( data ) ) {
					throw new Error( 'Invalid response data' );
				}

				renderPosts( data.items );

				/**
				 * "next" field should be falsy if there are no more posts to load -
				 * we're determining the button visibility based on that value.
				 */
				if ( data.next ) {
					/**
					 * Save next URL as button's attribute.
					 */
					btnEl.setAttribute( btnURLAttr, data.next );

					showEl( btnEl );
				} else {
					isEndOfData = true;

					/**
					 * Hide button if no more data is available.
					 */
					hideEl( btnEl );
				}

				isFetching = false;

				hideEl( loadingEl );
			} )
			.catch( () => {
				isFetching = false;

				/**
				 * Display error message and keep the button visible to enable retrying.
				 */
				hideEl( loadingEl );
				showEl( errorEl );
				showEl( btnEl );
			} );
	};

	/**
	 * Concatenates & renders posts' HTML string into dedicated container.
	 *
	 * @param {DOMElement} targetEl
	 * @param {Array.<{html: String}>} items
	 */
	function renderPosts( items ) {
		const postsHTML = items.map( item => item.html || '' ).join( '' );

		return postsContainerEl.insertAdjacentHTML( 'beforeend', postsHTML );
	}
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
	if (
		data &&
		hasOwnProp( data, 'items' ) &&
		hasOwnProp( data, 'next' ) &&
		Array.isArray( data.items ) &&
		data.items.length &&
		hasOwnProp( data.items[ 0 ], 'html' ) &&
		typeof data.items[ 0 ].html === 'string'
	) {
		return true;
	}

	return false;
}

/**
 * Adds the 'hidden' attribute to given DOM element.
 *
 * @param {DOMElement} el
 */
function hideEl( el ) {
	return el.setAttribute( 'hidden', '' );
}

/**
 * Removes the 'hidden' attribute from given DOM element.
 *
 * @param {DOMElement} el
 */
function showEl( el ) {
	return el.removeAttribute( 'hidden' );
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
