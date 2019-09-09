import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerFeaturedImageBlock = () => registerBlockType( 'newspack-blocks/featured-image', {
	title: 'Featured Image',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { post } = attributes;
		return (
			<img src={ post.featured_image } />
		)
	},
	save: ( { attributes } ) => {
		const { post } = attributes;
		return (
			<img src={ post.featured_image } />
		)
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				featured_image: 'https://placekitten.com/640/480'
			},
		},
	},
} );;
