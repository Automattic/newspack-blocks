/**
 * External dependencies
 */
import { merge } from 'lodash';
import { __, sprintf } from '@wordpress/i18n';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.css';

/**
 * @param {string} container Selector
 * @param {Object} params Params passed to Swiper
 */
export default function createSwiper( container = '.swiper-container', params = {} ) {
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
	};

	return new Swiper( container, merge( {}, defaultParams, params ) );
}
