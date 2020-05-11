/**
 * External dependencies
 */
import { speak } from '@wordpress/a11y';
import { __, sprintf } from '@wordpress/i18n';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
export function activateSlide( slide ) {
	slide.ariaHidden = 'false';
	/**
	 * Calls Array.prototype.forEach for IE11 compatibility.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	 */
	Array.prototype.forEach.call( slide.querySelectorAll( 'a' ), e => ( e.tabIndex = '0' ) );
}

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
export function deactivateSlide( slide ) {
	slide.ariaHidden = 'true';
	/**
	 * Calls Array.prototype.forEach for IE11 compatibility.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	 */
	Array.prototype.forEach.call( slide.querySelectorAll( 'a' ), e => ( e.tabIndex = '-1' ) );
}

/**
 * @param {Object} els Swiper elements
 * @param {Element} els.container Container element
 * @param {Element} els.next Next button element
 * @param {Element} els.prev Previous button element
 * @param {Element} els.play Play button element
 * @param {Element} els.pause Pause button element
 * @param {Element} els.pagination Pagination element
 * @param {Object} config Swiper config
 */
export function createSwiper( els, config = {} ) {
	return new Swiper( els.container, {
		/**
		 * Remove the messages, as we're announcing the slide content and number. These messages are overwriting the slide announcement.
		 */

		a11y: false,
		autoplay: !! config.autoplay && {
			delay: config.delay,
			disableOnInteraction: false,
		},
		effect: 'slide',
		grabCursor: true,
		init: true,
		initialSlide: config.initialSlide || 0,
		loop: true,
		navigation: {
			nextEl: els.next,
			prevEl: els.prev,
		},
		pagination: {
			bulletElement: 'button',
			clickable: true,
			el: els.pagination,
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
				if ( els.pause ) {
					els.pause.addEventListener( 'click', () => {
						if ( this.destroyed ) {
							return;
						}

						this.autoplay.stop();
						els.container.classList.remove( 'wp-block-newspack-blocks-carousel__autoplay-playing' );
						speak( __( 'Paused', 'newspack-blocks' ), 'assertive' );
						// Move focus to the play button.
						els.play.focus();
					} );
				}
				if ( els.play ) {
					els.play.addEventListener( 'click', () => {
						if ( this.destroyed ) {
							return;
						}

						this.autoplay.start();
						els.container.classList.add( 'wp-block-newspack-blocks-carousel__autoplay-playing' );
						speak( __( 'Playing', 'newspack-blocks' ), 'assertive' );
						// Move focus to the pause button.
						els.pause.focus();
					} );
				}

				/**
				 * Calls Array.prototype.forEach for IE11 compatibility.
				 *
				 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
				 */
				Array.prototype.forEach.call( this.wrapperEl.querySelectorAll( '.swiper-slide' ), slide =>
					deactivateSlide( slide )
				);

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
	} );
}
