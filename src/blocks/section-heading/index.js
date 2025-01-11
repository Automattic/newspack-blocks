/**
 * WordPress dependencies
 */
import { Icon, edit as editView } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import metadata from './block.json';
const { name, attributes, category } = metadata;

// Name must be exported separately.
export { name };

export const title = 'Section Heading';

export const settings = {
	title,
	icon: {
		src: <Icon icon={editView} />,
		foreground: '#36f',
	},
	description: 'Enter header name',
	attributes,
	category,
	supports: {
		html: false,
		default: '',
	},
	edit,
	save,
};
