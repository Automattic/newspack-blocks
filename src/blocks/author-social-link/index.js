/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { share } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';

const { name } = metadata;

export { name };

export const settings = {
	...metadata,
	title: __( 'Author Social Link', 'newspack-blocks' ),
	icon: share,
	edit,
	save: () => null,
};
