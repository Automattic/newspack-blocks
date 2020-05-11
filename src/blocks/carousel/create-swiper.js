/**
 * External dependencies
 */
import { merge } from 'lodash';
import { speak } from '@wordpress/a11y';
import { escapeHTML } from '@wordpress/escape-html';
import { __, sprintf } from '@wordpress/i18n';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
export function activateSlide( slide ) {
	slide.setAttribute( 'aria-hidden', 'false' );

	/**
	 * Calls Array.prototype.forEach for IE11 compatibility.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	 */
	Array.prototype.forEach.call( slide.querySelectorAll( 'a' ), el =>
		el.removeAttribute( 'tabindex' )
	);
}

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
export function deactivateSlide( slide ) {
	slide.setAttribute( 'aria-hidden', 'true' );
	/**
	 * Calls Array.prototype.forEach for IE11 compatibility.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	 */
	Array.prototype.forEach.call( slide.querySelectorAll( 'a' ), el =>
		el.setAttribute( 'tabindex', '-1' )
	);
}

/**
 * @param {string} container Selector
 * @param {Object} params Params passed to Swiper
 */
export function createSwiper( container = '.swiper-container', params = {} ) {
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
				const currentSlide = this.slides[ this.activeIndex ];

				deactivateSlide( this.slides[ this.previousIndex ] );

				activateSlide( currentSlide );

				// If we're autoplaying, don't announce the slide change, as that would be supremely annoying.
				if ( ! this.autoplay.running ) {
					// Announce the contents of the slide.
					const currentImage = currentSlide.querySelector( 'img' );
					const alt = currentImage ? currentImage.alt : false;

					const slideInfo = sprintf(
						/* translators: current slide number and the total number of slides */
						__( 'Slide %s of %s', 'newspack-blocks' ),
						this.realIndex + 1,
						this.pagination.bullets.length
					);

					speak(
						escapeHTML(
							`${ currentSlide.innerText }, 
							${ alt ? sprintf( __( 'Image: %s, ', 'newspack-blocks' ), alt ) : '' }
							${ slideInfo }`
						),
						'assertive'
					);
				}
			},
		},
	};

	return new Swiper( container, merge( {}, defaultParams, params ) );
}
