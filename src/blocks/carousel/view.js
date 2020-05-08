/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { speak } from '@wordpress/a11y';
import { __, sprintf } from '@wordpress/i18n';

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

			const activateSlide = slide => {
				slide.ariaHidden = 'false';
				slide.querySelectorAll( 'a' ).forEach( e => ( e.tabIndex = '0' ) );
			};

			const deactivateSlide = slide => {
				slide.ariaHidden = 'true';
				slide.querySelectorAll( 'a' ).forEach( e => ( e.tabIndex = '-1' ) );
			};

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
								speak( __( 'Paused', 'newspack-blocks' ), 'assertive' );
								// Move focus to the play button.
								els.play.focus();
							} );
						}
						if ( els.play ) {
							els.play.addEventListener( 'click', () => {
								this.autoplay.start();
								block.classList.add( 'wp-block-newspack-blocks-carousel__autoplay-playing' );
								speak( __( 'Playing', 'newspack-blocks' ), 'assertive' );
								// Move focus to the pause button.
								els.pause.focus();
							} );
						}

						this.wrapperEl
							.querySelectorAll( '.swiper-slide' )
							.forEach( slide => deactivateSlide( slide ) );

						// Set-up our active slide.
						activateSlide( this.slides[ this.activeIndex ] );
					},
					slideChange() {
						deactivateSlide( this.slides[ this.previousIndex ] );

						activateSlide( this.slides[ this.activeIndex ] );

						// If we're autoplaying, don't announce the slide change, as that would be supremely annoying.
						if ( ! this.autoplay.running ) {
							// Announce the contents of the slide.
							speak(
								`${ this.slides[ this.activeIndex ].innerHTML }, ${ sprintf(
									/* translators: current slide number and the total number of slides */
									__( 'Slide %s of %s', 'newspack-blocks' ),
									this.realIndex + 1,
									this.pagination.bullets.length
								) }`,
								'assertive'
							);
						}
					},
				},
			};
			createSwiper( container, swiperConfig );
		} );
	} );
}
