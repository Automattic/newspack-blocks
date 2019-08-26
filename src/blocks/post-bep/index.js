/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '@wordpress/i18n';
import edit from './edit';

/**
 * Style dependencies
 */
import './editor.scss';
import './view.scss';

export const name = 'post-bep';
export const title = __( 'Post (Block Editor Provider)' );

export const settings = {
	title,
	category: 'newspack',
	keywords: [],
	description: __( 'Render a single post.' ),
	attributes: {
		className: {
			type: 'string',
		},
		post: {
			type: 'object',
		},
		showImage: {
			type: 'boolean',
			default: true,
		},
	},
	supports: {
		inserter: false,
		html: false,
		align: false,
	},
	edit,
	save: () => null, // to use view.php
};
