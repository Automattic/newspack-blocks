/**
 * External dependencies
 */
import { registerBlockStyle } from '@wordpress/blocks';
import './editor.scss';

registerBlockStyle( 'core/group', {
	name: 'alignleft',
	label: 'Align Left',
} );

registerBlockStyle( 'core/group', {
	name: 'alignright',
	label: 'Align Right',
} );
