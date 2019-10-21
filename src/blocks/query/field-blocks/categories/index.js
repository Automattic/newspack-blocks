import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { withSelect } from '@wordpress/data';
import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const Edit = withSelect( select => {
	return {
		allCategories: select( 'core' ).getEntityRecords( 'taxonomy', 'category' ),
	}
} )( ( { allCategories } ) => {
	const [ postCategories ] = useEntityProp( 'postType', 'post', 'categories' );
	const categories = ( allCategories || [] ).filter( c => postCategories.includes( c.id ) );
	return <ul>
		{ categories.map( c => <li key={ c.id }><a href={ c.link }>{ c.name }</a></li> ) }
	</ul>
} );

export const registerCategoriesBlock = () => registerBlockType( 'newspack-blocks/post-categories', {
	title: 'Post Categories',
	category: 'layout',
	parent,
	edit: Edit,
	save: () => {},
} );
