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

/**
 * Load More Button Handling
 */
document
	.querySelectorAll( '[data-load-more-btn]' )
	.forEach( makeLoadMoreHandler )

function makeLoadMoreHandler( btnEl ) {
	if ( !btnEl ) {
		return null;
	}

	const btnURLAttr = 'data-load-more-url';
	let isFetching = false;
	let isEndOfData = false;

	btnEl.addEventListener( 'click', function() {
		if ( isFetching || isEndOfData ) {
			return false;
		}

		/**
		 * Set elements from scope determined by the clicked "Load more" button.
		 */
		const blockWrapperEl = btnEl.parentElement; // scope root element
		const postsContainerEl = blockWrapperEl.querySelector( '[data-posts-container]' );
		const loadingEl = blockWrapperEl.querySelector( '[data-load-more-loading-text]' );
		const errorEl = blockWrapperEl.querySelector( '[data-load-more-error-text]' );

		hideEl( btnEl );
		hideEl( errorEl );
		showEl( loadingEl );

		isFetching = true;

		apiFetch( { url: btnEl.getAttribute( btnURLAttr ) } )
			.then( ( data ) => {
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
			.catch( ( error ) => {
				// console.error( error );

				hideEl( loadingEl )
				showEl( errorEl );
				showEl( btnEl );

				isFetching = false;
			} );
	} );
};

function renderPosts( targetEl, items ) {
	if ( !targetEl || !items || items.length === 0 ) {
		return null;
	}

	const postsHTML = items.map( item => item.html || "" ).join( '' );

	return targetEl.insertAdjacentHTML( 'beforeend', postsHTML );
};

function hideEl( el ) {
	if ( !el ) {
		return null;
	}

	return el.setAttribute( 'hidden', '' );
};

function showEl( el ) {
	if ( !el ) {
		return null;
	}

	return el.removeAttribute( 'hidden' );
}
