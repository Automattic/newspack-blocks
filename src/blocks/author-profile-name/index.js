/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { title as titleIcon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';

const { name } = metadata;

export { name };

export const settings = {
	...metadata,
	title: __( 'Author Name', 'newspack-blocks' ),
	icon: titleIcon,
	edit,
	save: () => null,
};
