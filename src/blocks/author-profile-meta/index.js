/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';

const { name } = metadata;

export { name };

export const settings = {
	...metadata,
	title: __( 'Author Meta', 'newspack-blocks' ),
	icon: info,
	edit,
	save: () => null,
};
