import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerPostCategoriesBlock = () => registerBlockType( 'newspack-blocks/post-categories', {
	title: 'Post Categories',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { post } = attributes;
		return <li>
			{ post.categories.map( c => <li>{ c }</li> ) }
		</li>
	},
	save: ( { attributes } ) => {
		const { post } = attributes;
		return <li>
			{ post.categories.map( c => <li>{ c }</li> ) }
		</li>
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				categories: [ 'foo', 'bar' ]
			}
		}
	}
} );
