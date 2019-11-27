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

if ( page ) {
  page.addEventListener( 'click', handlePageClick );
}

function handlePageClick( event ) {
  const isLoadMoreBtnClick = !!event.target.hasAttribute( loadMoreBtnURLAttr );

  if ( isLoadMoreBtnClick ) {
    handleLoadMoreBtnClick( event.target );
  }
}

function handleLoadMoreBtnClick( loadMoreBtn ) {
  if ( isFetching || !loadMoreBtn ) {
    return false;
  }

  const loadMoreURL = loadMoreBtn.getAttribute( loadMoreBtnURLAttr );
  const blockWrapper = loadMoreBtn.parentElement;
  const loadMoreLoadingText = blockWrapper.querySelector( '[data-load-more-loading-text]' );
  const postsContainer = blockWrapper.querySelector( '[data-posts-container]' );

  loadMoreBtn.setAttribute( 'hidden', '' );
  loadMoreBtn.setAttribute( 'disabled', '' );
  loadMoreLoadingText.removeAttribute( 'hidden' )

  isFetching = true;

  apiFetch( { url: loadMoreURL } )
    .then(( data ) => {
      renderPosts( postsContainer, data.items );

      loadMoreBtn.setAttribute( loadMoreBtnURLAttr, data.next );

      loadMoreLoadingText.setAttribute( 'hidden', '' );
      loadMoreBtn.removeAttribute( 'hidden' );
      loadMoreBtn.removeAttribute( 'disabled' );

      isFetching = false;
    })
    .catch(( error ) => {
      console.log( 'Something went wrong!' );

      isFetching = false;
    });
};

function renderPosts( targetEl, items ) {
  const postsHTML = items.map( item => item.html ).join( '' );

  targetEl.insertAdjacentHTML( 'beforeend', postsHTML );
}
