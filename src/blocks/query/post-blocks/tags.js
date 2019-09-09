import { registerBlockType } from '@wordpress/blocks';
import { withSelect } from '@wordpress/data';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

const Edit =  ( { attributes, allTags } ) => {
	const { post } = attributes;
	const tags = ( allTags || [] ).filter( t => { return post.tags.includes( t.id ) } );
	return <ul>
		{ tags.map( t => <li key={ t.id }><a href={ t.link }>{ t.name }</a></li> ) }
	</ul>
}

const editWithSelect = withSelect( ( select, props ) => {
	const { getEntityRecords } = select( 'core' );
	return {
		allTags: getEntityRecords( 'taxonomy', 'post_tag' )
	};
} )( Edit );

export const registerPostTagsBlock = () => registerBlockType( 'newspack-blocks/post-tags', {
	title: 'Post Tags',
	category: 'layout',
	parent,
	edit: editWithSelect,
	save: editWithSelect,
	attributes: {
		post: {
			type: 'object',
			default: {
				tags: []
			}
		}
	}
} );
