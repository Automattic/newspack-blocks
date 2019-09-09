import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerPostContentBlock = () => registerBlockType( 'newspack-blocks/post-content', {
	title: 'Post Content',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { post } = attributes;
		return <RawHTML>{ post.content.rendered }</RawHTML>
	},
	save: ( { attributes } ) => {
		return <RawHTML>{ post.content.rendered }</RawHTML>
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				content: {
					rendered: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>'
				}
			}
		}
	}
} );
