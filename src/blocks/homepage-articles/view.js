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
const postsContainer = document.querySelector( '[data-posts-container]');

if ( loadMoreBtn ) {
  loadMoreBtn.addEventListener( 'click', handleLoadMoreBtnClick );
}

function handleLoadMoreBtnClick() {
  const loadMoreURL = this.getAttribute( loadMoreBtnURLAttr );

  apiFetch( { url: loadMoreURL } )
    .then(( data ) => {
      renderPosts( data.items );
      loadMoreBtn.setAttribute( loadMoreBtnURLAttr, data.next );
    })
    .catch(( error ) => {
      console.log( 'Something went wrong!' );
    });
};

function renderPosts( items ) {
  const postsHTML = items.map( item => item.html ).join( '' );

  postsContainer.insertAdjacentHTML( 'beforeend', postsHTML );
}
