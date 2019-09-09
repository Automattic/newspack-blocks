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
		if ( ! post.newspack_featured_image_src ) {
			return null;
		}

		return (
			<img src={ post.newspack_featured_image_src.thumbnail } />
		)
	},
	save: ( { attributes } ) => {
		const { post } = attributes;
		if ( ! post.newspack_featured_image_src ) {
			return null;
		}

		return (
			<img src={ post.newspack_featured_image_src.thumbnail } />
		)
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				newspack_featured_image_src: {
					full: 'https://placekitten.com/1920/1080',
					large: 'https://placekitten.com/2180/720',
					medium: 'https://placekitten.com/854/480',
					thumbnail: 'https://placekitten.com/150/150',
				}
			},
		},
	},
} );;
