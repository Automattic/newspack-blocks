import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerExcerptBlock = () => registerBlockType( 'newspack-blocks/excerpt', {
	title: 'Excerpt',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		return <RawHTML>{ attributes.post.excerpt.rendered }</RawHTML>
	},
	save: ( { attributes } ) => {
		return <RawHTML>{ attributes.post.excerpt.rendered }</RawHTML>
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				excerpt: {
					rendered: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>'
				}
			}
		}
	}
} );
