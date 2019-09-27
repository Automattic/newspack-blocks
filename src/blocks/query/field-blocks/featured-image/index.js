import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

export const registerFeaturedImageBlock = () => registerBlockType( 'newspack-blocks/featured-image', {
	title: 'Featured Image',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const [ featuredImageId ] = useEntityProp( 'postType', 'post', 'featured_media' );
		const { post } = attributes;
		if ( ! post.newspack_featured_image_src ) {
			return null;
		}

		return (
			<img src={ post.newspack_featured_image_src.thumbnail } width="150" height="150" />
		)
	},
	save: () => null,
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
