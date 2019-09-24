import { registerBlockType } from '@wordpress/blocks';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const Edit = ( { attributes } ) => {
	const { post, allTags } = attributes;
	const tags = ( allTags || [] ).filter( t => post.tags.includes( t.id ) );
	return <ul>
		{ tags.map( t => <li key={ t.id }><a href={ t.link }>{ t.name }</a></li> ) }
	</ul>
}

export const registerTagsBlock = () => registerBlockType( 'newspack-blocks/tags', {
	title: 'Tags',
	category: 'layout',
	parent,
	edit: Edit,
	save: () => null,
	attributes: {
		post: {
			type: 'object',
			default: {
				allTags: [],
				tags: []
			}
		}
	}
} );
