/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';

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
			const els = {
				prev: block.querySelector( '.swiper-button-prev' ),
				next: block.querySelector( '.swiper-button-next' ),
				pagination: block.querySelector( '.swiper-pagination-bullets' ),
				pause: block.querySelector( '.swiper-button-pause' ),
				play: block.querySelector( '.swiper-button-play' ),
			};
			const autoplay = parseInt( block.dataset.autoplay ) ? true : false;
			const delay = parseInt( block.dataset.autoplay_delay ) * 1000;
			const swiperConfig = {
				autoplay: autoplay
					? {
							delay,
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
								this.a11y.notify( __( 'Paused' ) );
								// Move focus to the play button.
								els.play.focus();
							} );
						}
						if ( els.play ) {
							els.play.addEventListener( 'click', () => {
								this.autoplay.start();
								block.classList.add( 'wp-block-newspack-blocks-carousel__autoplay-playing' );
								this.a11y.notify( __( 'Playing' ) );
								// Move focus to the pause button.
								els.pause.focus();
							} );
						}

						// Set tabindex to -1 on all focusable elements that are not the current slide.
						this.wrapperEl.querySelectorAll( 'a' ).forEach( e => ( e.tabIndex = '-1' ) );

						// Get the active slide's <a> and make them focusable again
						this.slides[ this.activeIndex ]
							.querySelectorAll( 'a' )
							.forEach( e => ( e.tabIndex = '0' ) );
					},
					slideChange() {
						// Get all the previous slides' <a> and set to tabIndex -1
						this.slides[ this.previousIndex ]
							.querySelectorAll( 'a' )
							.forEach( e => ( e.tabIndex = '-1' ) );

						// Get the active slide's <a> and make them focusable again
						this.slides[ this.activeIndex ]
							.querySelectorAll( 'a' )
							.forEach( e => ( e.tabIndex = '0' ) );
					},
				},
			};
			createSwiper( container, swiperConfig );
		} );
	} );
}
