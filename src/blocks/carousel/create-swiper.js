/**
 * External dependencies
 */
import { merge } from 'lodash';
import { speak } from '@wordpress/a11y';
import { __, sprintf } from '@wordpress/i18n';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

export const activateSlide = slide => {
	slide.ariaHidden = 'false';
	slide.querySelectorAll( 'a' ).forEach( e => ( e.tabIndex = '0' ) );
};

export const deactivateSlide = slide => {
	slide.ariaHidden = 'true';
	slide.querySelectorAll( 'a' ).forEach( e => ( e.tabIndex = '-1' ) );
};

/**
 * @param {string} container Selector
 * @param {Object} params Params passed to Swiper
 */
export const createSwiper = ( container = '.swiper-container', params = {} ) => {
	const defaultParams = {
		/**
		 * Remove the messages, as we're announcing the slide content and number. These messages are overwriting the slide announcement.
		 */

		a11y: false,
		effect: 'slide',
		grabCursor: true,
		init: true,
		initialSlide: 0,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
		pagination: {
			bulletElement: 'button',
			clickable: true,
			el: '.swiper-pagination',
			type: 'bullets',
			renderBullet: ( index, className ) => {
				// Use a custom render, as Swiper's render is inaccessible.
				return `<button class="${ className }"><span>${ sprintf(
					__( 'Slide %s', 'newspack-blocks' ),
					index + 1
				) }</span></button>`;
			},
		},
		preventClicksPropagation: false /* Necessary for normal block interactions */,
		releaseFormElements: false,
		setWrapperSize: true,
		touchStartPreventDefault: false,
		on: {
			init() {
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

	return new Swiper( container, merge( {}, defaultParams, params ) );
};
