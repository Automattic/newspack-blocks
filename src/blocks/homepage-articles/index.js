/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';
import { createBlock } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { __, _x } from '@wordpress/i18n';
import edit from './edit';

/**
 * Style dependencies - will load in editor
 */
import './editor.scss';
import './view.scss';

export const name = 'homepage-articles';
export const title = __( 'Newspack Homepage Articles', 'newspack-blocks' );

/* From https://material.io/tools/icons */
export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
	</SVG>
);

export const settings = {
	title,
	icon,
	category: 'newspack',
	keywords: [
		__( 'posts', 'newspack-blocks' ),
		__( 'articles', 'newspack-blocks' ),
		__( 'latest', 'newspack-blocks' ),
	],
	description: __( 'A block for displaying homepage articles.', 'newspack-blocks' ),
	styles: [
		{ name: 'default', label: _x( 'Default', 'block style', 'newspack-blocks' ), isDefault: true },
		{ name: 'borders', label: _x( 'Borders', 'block style', 'newspack-blocks' ) },
	],
	attributes: {
		className: {
			type: 'string',
		},
		showExcerpt: {
			type: 'boolean',
			default: true,
		},
		showDate: {
			type: 'boolean',
			default: true,
		},
		showImage: {
			type: 'boolean',
			default: true,
		},
		showCaption: {
			type: 'boolean',
			default: false,
		},
		imageShape: {
			type: 'string',
			default: 'landscape',
		},
		minHeight: {
			type: 'integer',
			default: 100,
		},
		showAuthor: {
			type: 'boolean',
			default: true,
		},
		showAvatar: {
			type: 'boolean',
			default: true,
		},
		showCategory: {
			type: 'boolean',
			default: false,
		},
		postLayout: {
			type: 'string',
			default: 'list',
		},
		columns: {
			type: 'integer',
			default: 3,
		},
		postsToShow: {
			type: 'integer',
			default: 3,
		},
		mediaPosition: {
			type: 'string',
			default: 'top',
		},
		authors: {
			type: 'array',
		},
		categories: {
			type: 'array',
		},
		tags: {
			type: 'array',
		},
		single: {
			type: 'string',
		},
		typeScale: {
			type: 'integer',
			default: 4,
		},
		imageScale: {
			type: 'integer',
			default: 3,
		},
		sectionHeader: {
			type: 'string',
			default: '',
		},
		singleMode: {
			type: 'boolean',
			default: false,
		},
		textColor: {
			type: 'string',
			default: '',
		},
		customTextColor: {
			type: 'string',
			default: '',
		},
		singleMode: {
			type: 'boolean',
			default: false,
		},
	},
	supports: {
		html: false,
		align: false,
	},
	edit,
	save: () => null, // to use view.php
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/latest-posts' ],
				transform: ( {
					displayPostContent,
					displayPostDate,
					postLayout,
					columns,
					postsToShow,
					categories,
				} ) => {
					return createBlock( 'newspack-blocks/homepage-articles', {
						showExcerpt: displayPostContent,
						showDate: displayPostDate,
						postLayout,
						columns,
						postsToShow,
						showAuthor: false,
						categories: categories ? [ categories ] : [],
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/latest-posts' ],
				transform: ( { showExcerpt, showDate, postLayout, columns, postsToShow, categories } ) => {
					return createBlock( 'core/latest-posts', {
						displayPostContent: showExcerpt,
						displayPostDate: showDate,
						postLayout,
						columns,
						postsToShow,
						categories: categories[ 0 ] || '',
					} );
				},
			},
		],
	},
};
