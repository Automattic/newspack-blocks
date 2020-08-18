/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import AudioPlayer from './AudioPlayer';

/**
 * Style dependencies - will load in editor
 */
// import './editor.scss';
// import './view.scss';
import metadata from './block.json';
const { name, attributes, category } = metadata;

// Name must be exported separately.
export { name };

export const title = __( 'Audio', 'newspack-blocks' );

export const settings = {
	title,
	icon: 'format-audio',
	attributes,
	category,
	keywords: [ __( 'audio', 'newspack-blocks' ) ],
	description: __( 'A block for displaying audio.', 'newspack-blocks' ),
	styles: [],
	supports: {
		html: false,
		align: [ 'wide', 'full' ],
		default: '',
	},
	edit,
	save: AudioPlayer,
};
