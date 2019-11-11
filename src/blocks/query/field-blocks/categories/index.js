import { Path, SVG } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { withSelect } from '@wordpress/data';
import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
	</SVG>
);

const Edit = withSelect( select => {
	return {
		allCategories: select( 'core' ).getEntityRecords( 'taxonomy', 'category' ),
	}
} )( ( { allCategories } ) => {
	const [ postCategories ] = useEntityProp( 'postType', 'post', 'categories' );
	const categories = ( allCategories || [] ).filter( c => postCategories.includes( c.id ) );
	return <div className="article-section-categories">
		{ categories.map( c => <span className="cat-links" key={ c.id }><a href={ c.link }>{ c.name }</a></span> ) }
	</div>
} );

export const registerCategoriesBlock = () => registerBlockType( 'newspack-blocks/post-categories', {
	title: 'Post Categories',
	category: 'layout',
	icon,
	parent,
	edit: Edit,
	save: () => {},
} );
