/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
const { name } = metadata;

// Name must be exported separately.
export { name };

export const settings = {
	...metadata,
	edit,
	save: () => null, // to use view.php
};
