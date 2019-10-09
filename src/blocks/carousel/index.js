/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __, _x } from '@wordpress/i18n';
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';

export const name = 'carousel';
export const title = __( 'Articles Carousel' );

/* From https://material.io/tools/icons */
export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	keywords: [ __( 'posts' ), __( 'slideshow' ), __( 'carousel' ) ],
	description: __( 'A carousel of articles.' ),
	attributes: {
		className: {
			type: 'string',
		},
		autoplay: {
			type: 'boolean',
			default: false,
		},
		delay: {
			type: 'number',
			default: 3,
		},
		postsToShow: {
			type: 'integer',
			default: 3,
		},
		author: {
			type: 'string',
		},
		categories: {
			type: 'string',
		},
		tags: {
			type: 'string',
		},
	},
	supports: {
		html: false,
		align: false,
	},
	edit,
	save: () => null, // to use view.php
};
