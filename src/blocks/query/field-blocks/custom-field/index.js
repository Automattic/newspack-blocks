import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const Edit =  ( { attributes } ) => {
	const { post, allCategories } = attributes;
	const [ newspack_author_info ] = useEntityProp( 'postType', 'post', 'categories' );
	const categories = ( allCategories || [] ).filter( c => post.categories.includes( c.id ) )
	return <ul>
		{ categories.map( c => <li key={ c.id }><a href={ c.link }>{ c.name }</a></li> ) }
	</ul>
}

export const registerCategoriesBlock = () => registerBlockType( 'newspack-blocks/custom-field', {
	title: 'Post Categories',
	category: 'layout',
	parent,
	edit: Edit,
	save: () => {},
	attributes: {
		post: {
			type: 'object',
			default: {
				categories: [ 1 ]
			}
		}
	}
} );
