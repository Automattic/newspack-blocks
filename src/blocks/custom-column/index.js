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

export const name = 'custom-column';
export const title = __( 'Newspack Custom Column' );

export const settings = {
	title,
	parent: [ 'custom-columns' ],
	icon,
	description: __( 'A single column within a columns block.' ),
	category: 'newspack',
	supports: {
		inserter: false,
		reusable: false,
		html: false,
	},
	attributes: {
		verticalAlignment: {
			type: 'string',
		},
		width: {
			type: 'number',
			min: 0,
			max: 100,
		},
	},
	getEditWrapperProps( attributes ) {
		const { width } = attributes;
		if ( Number.isFinite( width ) ) {
			return {
				style: {
					flexBasis: 'calc(' + width + '% - 16px)',
				},
			};
		}
	},
	edit,
	save,
};
