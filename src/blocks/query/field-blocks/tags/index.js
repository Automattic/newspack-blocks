import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { withSelect } from '@wordpress/data';
import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const Edit = withSelect( select => {
	return {
		allTags:select( 'core' ).getEntityRecords( 'taxonomy', 'post_tag' ),
	}
} )( ( { allTags } ) => {
	const [ postTags ] = useEntityProp( 'postType', 'post', 'tags' );
	const tags = ( allTags || [] ).filter( t => postTags.includes( t.id ) );
	return <ul>
		{ tags.map( t => <li key={ t.id }><a href={ t.link }>{ t.name }</a></li> ) }
	</ul>
} )

export const registerTagsBlock = () => registerBlockType( 'newspack-blocks/tags', {
	title: 'Tags',
	category: 'layout',
	parent,
	edit: Edit,
	save: () => null,
} );
