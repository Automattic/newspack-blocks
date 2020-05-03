/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import createSwiper from './create-swiper';
import './view.scss';

if ( typeof window !== 'undefined' ) {
	domReady( () => {
		const blocksArray = Array.from(
			document.querySelectorAll( '.wp-block-newspack-blocks-carousel' )
		);
		blocksArray.forEach( block => {
			const container = block.querySelector( '.swiper-container' );
			createSwiper( container );
		} );
	} );
}
