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
const page = document.getElementById( 'page' );
const loadMoreBtnURLAttr = 'data-load-more-url';
let isFetching = false;
let isEndOfData = false;

if ( page ) {
  /**
   * Listen for clicks on the parent "page" element.
   */
  page.addEventListener( 'click', handlePageClick );
}

function handlePageClick( event ) {
  const isLoadMoreBtnClick = !!event.target.hasAttribute( loadMoreBtnURLAttr );

  if ( isLoadMoreBtnClick ) {
    handleLoadMoreBtnClick( event.target );
  }
}

function handleLoadMoreBtnClick( loadMoreBtn ) {
  if ( !loadMoreBtn || isFetching || isEndOfData ) {
    return false;
  }

  /**
   * Set elements from scope determined by the clicked "Load more" button.
   */
  const blockWrapper = loadMoreBtn.parentElement; // scope root element
  const postsContainer = blockWrapper.querySelector( '[data-posts-container]' );
  const loadMoreLoadingText = blockWrapper.querySelector( '[data-load-more-loading-text]' );
  const loadMoreErrorText = blockWrapper.querySelector( '[data-load-more-error-text]' );

  const loadMoreURL = loadMoreBtn.getAttribute( loadMoreBtnURLAttr );

  hideEl( loadMoreBtn );
  hideEl( loadMoreErrorText );
  showEl( loadMoreLoadingText );

  isFetching = true;

  apiFetch( { url: loadMoreURL } )
    .then(( data ) => {
      renderPosts( postsContainer, data.items );

      if ( next ) {
        loadMoreBtn.setAttribute( loadMoreBtnURLAttr, data.next );
      } else {
        hideEl( loadMoreBtn );

        isEndOfData = true;
      }

      hideEl( loadMoreLoadingText );
      showEl( loadMoreBtn );

      isFetching = false;
    })
    .catch( () => {
      hideEl( loadMoreLoadingText )
      showEl( loadMoreErrorText );
      showEl( loadMoreBtn );

      isFetching = false;
    });
};

function renderPosts( targetEl, items ) {
  const postsHTML = items.map( item => item.html ).join( '' );

  targetEl.insertAdjacentHTML( 'beforeend', postsHTML );
};

function hideEl( el ) {
  return el.setAttribute( 'hidden', '');
};

function showEl( el ) {
  return el.removeAttribute( 'hidden' );
}
