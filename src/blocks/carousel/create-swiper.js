/**
 * External dependencies
 */
import { speak } from '@wordpress/a11y';
import { escapeHTML } from '@wordpress/escape-html';
import { __, sprintf } from '@wordpress/i18n';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

/**
 * A helper for IE11-compatible iteration over NodeList elements.
 *
 * @param {Object} nodeList List of nodes to be iterated over.
 * @param {Function} cb Invoked for each iteratee.
 */
function forEachNode( nodeList, cb ) {
	/**
	 * Calls Array.prototype.forEach for IE11 compatibility.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/NodeList
	 */
	Array.prototype.forEach.call( nodeList, cb );
}

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
function activateSlide( slide ) {
	slide.setAttribute( 'aria-hidden', 'false' );
	forEachNode( slide.querySelectorAll( 'a' ), el => el.removeAttribute( 'tabindex' ) );
}

/**
 * Modifies attributes on slide HTML to make it accessible.
 *
 * @param {HTMLElement} slide Slide DOM element
 */
function deactivateSlide( slide ) {
	slide.setAttribute( 'aria-hidden', 'true' );
	forEachNode( slide.querySelectorAll( 'a' ), el => el.setAttribute( 'tabindex', '-1' ) );
}

/**
 * Creates a Swiper instance with predefined config used by the Articles
 * Carousel block in both front-end and editor.
 *
 * @param {Object} els Swiper elements
 * @param {Element} els.block Block element
 * @param {Element} els.container Swiper container element
 * @param {Element} els.next Next button element
 * @param {Element} els.prev Previous button element
 * @param {Element} els.play Play button element
 * @param {Element} els.pause Pause button element
 * @param {Element} els.pagination Pagination element
 * @param {Object} config Swiper config
 * @return {Object} Swiper instance
 */
export default function createSwiper( els, config = {} ) {
	return new Swiper( els.container, {
		/**
		 * Remove the messages, as we're announcing the slide content and number.
		 * These messages are overwriting the slide announcement.
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
				const autoplayClassName = 'wp-block-newspack-blocks-carousel__autoplay-playing';

				if ( els.pause ) {
					els.pause.addEventListener( 'click', () => {
						if ( this.destroyed ) {
							return;
						}

						this.autoplay.stop();
						els.block.classList.remove( autoplayClassName );
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
						els.block.classList.add( autoplayClassName );
						speak( __( 'Playing', 'newspack-blocks' ), 'assertive' );
						// Move focus to the pause button.
						els.pause.focus();
					} );
				}

				forEachNode( this.wrapperEl.querySelectorAll( '.swiper-slide' ), slide =>
					deactivateSlide( slide )
				);

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
	} );
}
