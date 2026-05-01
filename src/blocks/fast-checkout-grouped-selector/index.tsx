import { __ } from '@wordpress/i18n';
import metadata from './block.json';
import edit from './edit';

export const name: string = metadata.name;
export const title: string = __( 'Fast Checkout — Grouped Product Selector', 'newspack-blocks' );

function save() {
	return null;
}

export const settings = {
	...metadata,
	title,
	edit,
	save,
};
