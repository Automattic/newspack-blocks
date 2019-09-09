import { registerBlockType } from '@wordpress/blocks';
import { withSelect } from '@wordpress/data';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

const Edit =  ( { attributes, allCategories } ) => {
	const { post } = attributes;
	const categories = ( allCategories || [] ).filter( c => post.categories.includes( c.id ) )
	return <ul>
		{ categories.map( c => <li key={ c.id }><a href={ c.link }>{ c.name }</a></li> ) }
	</ul>
}

const editWithSelect = withSelect( ( select, props ) => {
	const { getEntityRecords } = select( 'core' );
	return {
		allCategories: getEntityRecords( 'taxonomy', 'category', { per_page: -1, hide_empty: true } )
	};
} )( Edit );

export const registerPostCategoriesBlock = () => registerBlockType( 'newspack-blocks/post-categories', {
	title: 'Post Categories',
	category: 'layout',
	parent,
	edit: editWithSelect,
	save: editWithSelect,
	attributes: {
		post: {
			type: 'object',
			default: {
				categories: [ 1, 2 ]
			}
		}
	}
} );
