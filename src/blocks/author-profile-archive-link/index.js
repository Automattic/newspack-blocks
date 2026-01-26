/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { link } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';

const { name } = metadata;

export { name };

export const settings = {
	...metadata,
	title: __( 'Author Archive Link', 'newspack-blocks' ),
	icon: link,
	edit,
	save: () => null,
};
