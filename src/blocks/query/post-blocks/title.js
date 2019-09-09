import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerTitleBlock = () => registerBlockType( 'newspack-blocks/title', {
	title: 'Title',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		return <h1><a href={attributes.post.link}>{ attributes.post.title.raw }</a></h1>;
	},
	save: ( { attributes } ) => {
		return <h1><a href={attributes.post.link}>{ attributes.post.title.raw }</a></h1>;
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				title: {
					raw: "Hello World"
				}
			}
		}
	}
} );
