/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import edit from './edit';
import './view.scss';

/**
 * Style dependencies - will load in editor
 */

export const name = 'post';
export const title = __( 'Post' );

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
	keywords: [ __( 'posts' ), __( 'articles' ), __( 'latest' ) ],
	description: __( 'A single post.' ),
	attributes: {
		className: {
			type: 'string',
		},
		imageScale: {
			type: 'integer',
			default: 3,
		},
		mediaPosition: {
			type: 'string',
			default: 'top',
		},
		post: {
			type: 'object',
		},
		postLayout: {
			type: 'string',
			default: 'list',
		},
		showAuthor: {
			type: 'boolean',
			default: true,
		},
		showAvatar: {
			type: 'boolean',
			default: true,
		},
		showDate: {
			type: 'boolean',
			default: true,
		},
		showExcerpt: {
			type: 'boolean',
			default: true,
		},

		showImage: {
			type: 'boolean',
			default: true,
		},
		typeScale: {
			type: 'integer',
			default: 4,
		},
	},
	supports: {
		html: false,
		align: false,
	},
	edit,
	save: () => null, // to use view.php
};
