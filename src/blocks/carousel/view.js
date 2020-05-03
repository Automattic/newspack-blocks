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
			const params = Array.from( block.classList ).reduce(
				( accumulator, className ) => {
					const prefix = 'wp-block-newspack-carousel__param-';
					if ( 0 === className.indexOf( prefix ) ) {
						const a = className.split( prefix );
						const b = a[ a.length - 1 ].split( '-' );
						accumulator[ b[ 0 ] ] = b[ 1 ];
					}
					return accumulator;
				},
				{ autoplay: false, delay: 0 }
			);
			const els = {
				prev: block.querySelector( '.swiper-button-prev' ),
				next: block.querySelector( '.swiper-button-next' ),
				pagination: block.querySelector( '.swiper-pagination-bullets' ),
				pause: block.querySelector( '.swiper-button-pause' ),
				play: block.querySelector( '.swiper-button-play' ),
			};
			const swiperConfig = {
				autoplay: parseInt( params.autoplay )
					? {
							delay: parseInt( params.delay ) * 1000,
							disableOnInteraction: false,
					  }
					: false,
				effect: 'slide',
				initialSlide: 0,
				loop: true,
				navigation: {
					nextEl: els.next,
					prevEl: els.prev,
				},
				pagination: {
					clickable: true,
					el: els.pagination,
					type: 'bullets',
				},
				on: {
					init() {
						if ( els.pause ) {
							els.pause.addEventListener( 'click', () => {
								this.autoplay.stop();
								block.classList.remove( 'wp-block-newspack-blocks-carousel__autoplay-playing' );
							} );
						}
						if ( els.play ) {
							els.play.addEventListener( 'click', () => {
								this.autoplay.start();
								block.classList.add( 'wp-block-newspack-blocks-carousel__autoplay-playing' );
							} );
						}
					},
				},
			};
			createSwiper( container, swiperConfig );
		} );
	} );
}
