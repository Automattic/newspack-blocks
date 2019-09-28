/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import icon from './icon';
import save from './save';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';

export const name = 'custom-columns';
export const title = __( 'Newspack Custom Columns' );

export const settings = {
	title,
	icon,
	description: __(
		'Add a block that displays content in multiple columns, then add whatever content blocks you’d like.'
	),
	supports: {
		align: [ 'wide', 'full' ],
		html: false,
	},
	category: 'newspack',
	attributes: {
		verticalAlignment: {
			type: 'string',
		},
	},
	edit,
	save,
};
