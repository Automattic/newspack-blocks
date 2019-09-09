import { registerBlockType } from '@wordpress/blocks';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

const Edit =  ( { attributes } ) => {
	const { post, allTags } = attributes;
	const tags = ( allTags || [] ).filter( t => { return post.tags.includes( t.id ) } );
	return <ul>
		{ tags.map( t => <li key={ t.id }><a href={ t.link }>{ t.name }</a></li> ) }
	</ul>
}

export const registerPostTagsBlock = () => registerBlockType( 'newspack-blocks/post-tags', {
	title: 'Post Tags',
	category: 'layout',
	parent,
	edit: Edit,
	save: Edit,
	attributes: {
		post: {
			type: 'object',
			default: {
				tags: []
			}
		}
	}
} );
