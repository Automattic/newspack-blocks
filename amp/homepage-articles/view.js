let isFetching = false;
let isEndOfData = false;
buildLoadMoreHandler( document.querySelector( '.wp-block-newspack-blocks-homepage-articles' ) );
function addClass( el, classToAdd ) {
	const classes = classesArray( el );
	let hasClass = false;
	classes.forEach( function( c ) {
		if ( c.trim() === classToAdd.trim() ) {
			hasClass = true;
		}
	} );
	if ( ! hasClass ) {
		classes.push( classToAdd );
		el.className = classes.join( ' ' );
	}
}
function removeClass( el, classToRemove ) {
	const classes = classesArray( el );
	const newClasses = [];
	classes.forEach( function( c ) {
		if ( c.trim() !== classToRemove.trim() ) {
			newClasses.push( c );
		}
	} );
	if ( newClasses.length !== classes.length ) {
		el.className = newClasses.join( ' ' );
	}
}
function classesArray( el ) {
	return el.className.trim().split( /\s+/ );
}
function buildLoadMoreHandler( blockWrapperEl ) {
	const btnEl = blockWrapperEl.querySelector( '[data-next]' );
	if ( ! btnEl ) {
		return;
	}
	const postsContainerEl = blockWrapperEl.querySelector( '[data-posts]' );
	btnEl.addEventListener( 'click', function( e ) {
		if ( isFetching || isEndOfData ) {
			return false;
		}
		isFetching = true;
		removeClass( blockWrapperEl, 'is-error' );
		addClass( blockWrapperEl, 'is-loading' );
		AMP.getState( 'newspackHomepagePosts.exclude_ids' ).then( function( exclude_ids ) {
			const requestURL = new URL( btnEl.getAttribute( 'data-next' ) );
			requestURL.searchParams.set( 'exclude_ids', JSON.parse( exclude_ids ).join( ',' ) );
			apiFetchWithRetry( { url: requestURL.toString(), onSuccess, onError }, 3 );
		} );
		function onSuccess( data ) {
			AMP.getState( 'newspackHomepagePosts.exclude_ids' ).then( function( exclude_ids ) {
				AMP.setState( {
					newspackHomepagePosts: { exclude_ids: JSON.parse( exclude_ids ).concat( data.ids ) },
				} );
			} );
			if ( isPostsDataValid( data ) ) {
				data.items.forEach( item => {
					const tempDIV = document.createElement( 'div' );
					tempDIV.innerHTML = item.html.trim();
					postsContainerEl.appendChild( tempDIV.childNodes[ 0 ] );
				} );
				if ( data.next ) {
					btnEl.setAttribute( 'data-next', data.next );
				}
				if ( ! data.items.length || ! data.next ) {
					isEndOfData = true;
					removeClass( blockWrapperEl, 'has-more-button' );
				}
				isFetching = false;
				removeClass( blockWrapperEl, 'is-loading' );
			}
		}
		function onError() {
			isFetching = false;
			removeClass( blockWrapperEl, 'is-loading' );
			addClass( blockWrapperEl, 'is-error' );
		}
	} );
}
function apiFetchWithRetry( options, n ) {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if ( xhr.readyState !== 4 || n === 0 ) {
			return;
		}
		if ( xhr.status >= 200 && xhr.status < 300 ) {
			const data = JSON.parse( xhr.responseText );
			options.onSuccess( data );
			return;
		}
		options.onError();
		apiFetchWithRetry( options, n - 1 );
	};
	xhr.open( 'GET', options.url );
	xhr.send();
}
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
function hasOwnProp( obj, prop ) {
	return Object.prototype.hasOwnProperty.call( obj, prop );
}
