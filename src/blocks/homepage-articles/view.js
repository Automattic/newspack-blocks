/**
 * VIEW
 * JavaScript used on front of site.
 */

/**
 * Style dependencies
 */
import './view.scss';


/**
 * Load More Button Handling
 */
const loadMoreButton = document.querySelector( '[data-load-more-btn]' );
const loadMoreButtonURLAttribute = 'data-load-more-url';
const postsContainer = document.querySelector( '[data-posts-container]');

if ( loadMoreButton ) {
  loadMoreButton.addEventListener( 'click', handleLoadMoreButtonClick );
}

function handleLoadMoreButtonClick() {
  const loadMoreURL = this.getAttribute( loadMoreButtonURLAttribute );
  const request = new XMLHttpRequest();

  request.onload = function () {
    if ( request.status === 200 ) {
      const payload = JSON.parse( request.responseText );

      renderPosts( payload.items );
      loadMoreButton.setAttribute( loadMoreButtonURLAttribute, payload.next );
    } else {
      console.log( 'Something went wrong!' );
    }
  };

  request.open( 'GET', loadMoreURL );
  request.send();
};

function renderPosts( items ) {
  const postsHTML = items.map( item => item.html ).join( '' );

  postsContainer.insertAdjacentHTML( 'beforeend', postsHTML );
}
