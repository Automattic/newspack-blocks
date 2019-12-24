/**
 * External dependencies
 */
import { mapValues, merge } from 'lodash';
import Swiper from 'swiper';
import '../../../node_modules/swiper/dist/css/swiper.css';

export default function createSwiper(
	container = '.swiper-container',
	params = {},
	callbacks = {}
) {
	const defaultParams = {
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
		},
		preventClicksPropagation: false /* Necessary for normal block interactions */,
		releaseFormElements: false,
		setWrapperSize: true,
		touchStartPreventDefault: false,
	};
	// const [ { default: Swiper } ] = await Promise.all( [
	// 	import( /* webpackChunkName: "swiper" */ 'swiper' ),
	// ] );
	return new Swiper( container, merge( {}, defaultParams, params ) );
}
