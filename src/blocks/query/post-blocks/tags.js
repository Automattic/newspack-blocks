import { registerBlockType } from '@wordpress/blocks';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerPostTagsBlock = () => registerBlockType( 'newspack-blocks/post-tags', {
	title: 'Post Tags',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { post } = attributes;
		return <li>
			{ post.tags.map( c => <li>{ c }</li> ) }
		</li>
	},
	save: ( { attributes } ) => {
		const { post } = attributes;
		return <li>
			{ post.tags.map( c => <li>{ c }</li> ) }
		</li>
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				tags: [ 'foo', 'bar' ]
			}
		}
	}
} );
