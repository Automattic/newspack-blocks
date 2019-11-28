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
document
	.querySelectorAll( '[data-load-more-btn]' )
	.forEach( attachLoadMoreHandler );

/**
 * Attaches an event handler to the Load more button
 * @param {DOMElement} btnEl the button that was clicked
 */
function attachLoadMoreHandler(btnEl) {
	if (!btnEl) {
		return null;
	}

	const handler = buildLoadMoreHandler(btnEl);

	btnEl.addEventListener('click', handler);
};

/**
 * Builds a function to handle clicks on the load more button.
 * Creates internal state via closure to ensure all state is
 * isolated to a single Block + button instance.
 *
 * @param {DOMElement} btnEl the button that was clicked
 */
function buildLoadMoreHandler(btnEl) {
	/**
	 * Set elements from scope determined by the clicked "Load more" button.
	 */
	const blockWrapperEl = btnEl.parentElement; // scope root element
	const postsContainerEl = blockWrapperEl.querySelector('[data-posts-container]');
	const loadingEl = blockWrapperEl.querySelector('[data-load-more-loading-text]');
	const errorEl = blockWrapperEl.querySelector('[data-load-more-error-text]');

	let isFetching = false;
	let isEndOfData = false;

	return () => {
		if (isFetching || isEndOfData) {
			return false;
		}

		hideEl(btnEl);
		hideEl(errorEl);
		showEl(loadingEl);

		isFetching = true;

		apiFetch({ url: btnEl.getAttribute(btnURLAttr) })
			.then((data) => {
				renderPosts(postsContainerEl, data.items);

				/**
				 * "next" field should be falsy if there's no more posts to load -
				 * we're determining the button visibility based on that value.
				 */
				if (data.next) {
					btnEl.setAttribute(btnURLAttr, data.next);
					showEl(btnEl);
				} else {
					hideEl(btnEl);

					isEndOfData = true;
				}

				hideEl(loadingEl);

				isFetching = false;
			})
			.catch((error) => {
				// console.error( error );

				hideEl(loadingEl)
				showEl(errorEl);
				showEl(btnEl);

				isFetching = false;
			});
	};
}



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
