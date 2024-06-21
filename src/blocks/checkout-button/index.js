/**
 * WordPress dependencies
 */
import { Icon, button } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import metadata from './block.json';

const { name } = metadata;

// Name must be exported separately.
export { name };

export const settings = {
	...metadata,

	icon: {
		src: <Icon icon={ button } />,
		foreground: '#36f',
	},
	edit,
	save: () => null, // to use view.php.
	deprecated: [ { ...metadata, save } ],
};
