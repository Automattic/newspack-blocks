/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';

export const name = 'video-playlist';
export const title = __( 'Video Playlist', 'newspack-blocks' );

/* From https://material.io/tools/icons */
export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
		<Path d="M0 0h24v24H0V0z" fill="none" />
		<Path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8H3V9h9v2zm0-4H3V5h9v2z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	keywords: [
		__( 'video', 'newspack-blocks' ),
		__( 'playlist', 'newspack-blocks' ),
		__( 'youtube', 'newspack-blocks' ),
	],
	description: __( 'Embed a playlist of latest or specific YouTube videos.', 'newspack-blocks' ),
	attributes: {
		className: {
			type: 'string',
		},
		manual: {
			type: 'boolean',
		},
		videos: {
			type: 'array',
			default: [],
		},
		categories: {
			type: 'array',
			default: [],
		},
		videosToShow: {
			type: 'integer',
			default: 5
		},
	},
	supports: {
		html: false,
		align: false,
	},
	edit,
	save: () => null, // to use view.php
};
