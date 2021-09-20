/**
 * WordPress dependencies
 */
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import { iframeIcon } from './icons';

export const name = 'iframe';
export const title = __( 'Iframe', 'newspack-blocks' );

export const settings = {
	title,
	icon: {
		src: iframeIcon,
		foreground: '#36f',
	},
	category: 'newspack',
	keywords: [ __( 'iframe', 'newspack-blocks' ), __( 'project iframe', 'newspack-blocks' ) ],
	description: (
		<>
			<p>{ __( 'Embed an iframe.', 'newspack-blocks' ) }</p>
			<ExternalLink href={ __( 'https://newspack.pub/support/blocks/iframe-block/' ) }>
				{ __( 'Support reference', 'newspack-blocks' ) }
			</ExternalLink>
		</>
	),
	attributes: {
		src: {
			type: 'string',
		},
		archiveFolder: {
			type: 'string',
			default: '',
		},
		height: {
			type: 'string',
			default: '600px',
		},
		width: {
			type: 'string',
			default: '100%',
		},
		isFullScreen: {
			type: 'boolean',
			default: false,
		},
	},
	supports: {
		html: false,
		align: true,
	},
	edit,
	save: () => null, // to use view.php
};
