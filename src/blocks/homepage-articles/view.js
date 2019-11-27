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

function handleLoadMoreBtnClick() {
  const loadMoreURL = this.getAttribute( loadMoreBtnURLAttr );

  loadMoreBtn.setAttribute( 'hidden', '' );
  loadMoreBtn.setAttribute( 'disabled', '' );
  loadMoreLoadingText.removeAttribute( 'hidden' )

  apiFetch( { url: loadMoreURL } )
    .then(( data ) => {
      renderPosts( data.items );

      loadMoreBtn.setAttribute( loadMoreBtnURLAttr, data.next );

      loadMoreLoadingText.setAttribute( 'hidden', '' );
      loadMoreBtn.removeAttribute( 'hidden' );
      loadMoreBtn.removeAttribute( 'disabled' );
    })
    .catch(( error ) => {
      console.log( 'Something went wrong!' );
    });
};

function renderPosts( items ) {
  const postsHTML = items.map( item => item.html ).join( '' );

  postsContainer.insertAdjacentHTML( 'beforeend', postsHTML );
}
