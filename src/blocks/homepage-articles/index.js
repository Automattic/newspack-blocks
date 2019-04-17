/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import edit from './edit';
import save from './save';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';

export const name = 'homepage-articles';
export const title = __( 'Newspack Homepage Articles' );

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
	description: __( 'A block for displaying homepage articles.' ),
	attributes: {
		align: {
			type: 'string',
			default: '',
		},
		showExcerpt: {
			type: 'boolean',
			default: true,
		},
		showDate: {
			type: 'boolean',
			default: true,
		},
		showImage: {
			type: 'boolean',
			default: true,
		},
		showAuthor: {
			type: 'boolean',
			default: true,
		},
		showCategory: {
			type: 'boolean',
			default: true,
		},
		content: {
			type: 'string',
		},
	},
	supports: {
		html: false,
		align: [ 'left', 'right', 'center' ],
	},
	edit,
	save: () => null, // to use view.php
};
