/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Path, Rect, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import edit from './edit';
export const name = 'homepage-articles';
export const title = __( 'Newspack Attributes Example' );
export const icon = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Path d="M0,0h24v24H0V0z" fill="none" />
		<Rect x="11" y="7" width="6" height="2" />
		<Rect x="11" y="11" width="6" height="2" />
		<Rect x="11" y="15" width="6" height="2" />
		<Rect x="7" y="7" width="2" height="2" />
		<Rect x="7" y="11" width="2" height="2" />
		<Rect x="7" y="15" width="2" height="2" />
		<Path d="M20.1,3H3.9C3.4,3,3,3.4,3,3.9v16.2C3,20.5,3.4,21,3.9,21h16.2c0.4,0,0.9-0.5,0.9-0.9V3.9C21,3.4,20.5,3,20.1,3z M19,19H5V5h14V19z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	description: __( 'Display articles on the homepage.' ),
	keywords: [ __( 'recent posts' ) ],
	attributes: {
		categories: {
			type: 'string',
		},
		postsToShow: {
			type: 'number',
			default: 5,
		},
		displayPostDate: {
			type: 'boolean',
			default: false,
		},
		postLayout: {
			type: 'string',
			default: 'list',
		},
		columns: {
			type: 'number',
			default: 3,
		},
		order: {
			type: 'string',
			default: 'desc',
		},
		orderBy: {
			type: 'string',
			default: 'date',
		},
	},
	supports: {
		html: false,
		align: true,
	},
	edit,
	save: () => null,
};
