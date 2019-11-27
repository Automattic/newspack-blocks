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
const loadMoreBtn = document.querySelector( '[data-load-more-btn]' );
const loadMoreBtnURLAttr = 'data-load-more-url';
const loadMoreLoadingText = document.querySelector( '[data-load-more-loading-text' );
const postsContainer = document.querySelector( '[data-posts-container]');

if ( loadMoreBtn ) {
  loadMoreBtn.addEventListener( 'click', handleLoadMoreBtnClick );
}

let isFetching = false;

function handleLoadMoreBtnClick() {
  if ( isFetching ) {
    return false;
  }

  const loadMoreURL = this.getAttribute( loadMoreBtnURLAttr );

  loadMoreBtn.setAttribute( 'hidden', '' );
  loadMoreBtn.setAttribute( 'disabled', '' );
  loadMoreLoadingText.removeAttribute( 'hidden' )

  isFetching = true;

  apiFetch( { url: loadMoreURL } )
    .then(( data ) => {
      renderPosts( data.items );

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

function renderPosts( items ) {
  const postsHTML = items.map( item => item.html ).join( '' );

  postsContainer.insertAdjacentHTML( 'beforeend', postsHTML );
}
