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

	let isFetching = false;
	let isEndOfData = false;

	return () => {
		if ( isFetching || isEndOfData ) {
			return false;
		}

		hideEl( btnEl );
		hideEl( errorEl );
		showEl( loadingEl );

		isFetching = true;

		apiFetch( { url: btnEl.getAttribute( btnURLAttr ) } )
			.then( data => {
				if ( ! isDataValid( data ) ) {
					throw new Error( 'Invalid response data' );
				}

				renderPosts( postsContainerEl, data.items );

				/**
				 * "next" field should be falsy if there's no more posts to load -
				 * we're determining the button visibility based on that value.
				 */
				if ( data.next ) {
					btnEl.setAttribute( btnURLAttr, data.next );
					showEl( btnEl );
				} else {
					hideEl( btnEl );

					isEndOfData = true;
				}

				hideEl( loadingEl );

				isFetching = false;
			} )
			.catch( () => {
				hideEl( loadingEl );
				showEl( errorEl );
				showEl( btnEl );

				isFetching = false;
			} );
	};

  /**
	 * Validates the posts endpoint schema:
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
	function isDataValid( data ) {
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
	 * Renders posts' HTML string into target element.
	 *
	 * @param {DOMElement} targetEl
   * @param {Array.<{html: String}>} items
	 */
	function renderPosts( targetEl, items ) {
		if ( ! targetEl || ! items || ! items.length ) {
			return null;
		}

		const postsHTML = items.map( item => item.html || '' ).join( '' );

		return targetEl.insertAdjacentHTML( 'beforeend', postsHTML );
	}

	/**
	 * Adds the 'hidden' attribute to given DOM element.
	 *
	 * @param {DOMElement} el
	 */
	function hideEl( el ) {
		if ( ! el ) {
			return null;
		}

		return el.setAttribute( 'hidden', '' );
	}

	/**
	 * Removes the 'hidden' attribute from given DOM element.
	 *
	 * @param {DOMElement} el
	 */
	function showEl( el ) {
		if ( ! el ) {
			return null;
		}

		return el.removeAttribute( 'hidden' );
	}
}

/**
 * Checks if object has own property.
 *
 * @param {Object} obj
 * @param {String} prop
 */
function hasOwnProp( obj, prop ) {
	if ( ! obj || ! prop ) {
		return false;
	}

	return Object.prototype.hasOwnProperty.call( obj, prop );
}
