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

export const name = 'example2-attributes';
export const title = __( 'Newspack Attributes Example' );

/* From https://material.io/tools/icons */
export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path fill="none" d="M0 0h24v24H0z" />
		<Path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	keywords: [ __( 'news' ) ],
	description: __( 'Example of a block with attributes.' ),
	attributes: {
		align: {
			type: 'string',
			default: 'center',
		},
		backgroundColor: {
			type: 'string',
			default: 'white',
		},
		content: {
			type: 'string',
			source: 'html',
			selector: 'p',
			default: '',
		},
	},
	supports: {
		html: false,
		align: true,
	},
	edit,
	save,
};
