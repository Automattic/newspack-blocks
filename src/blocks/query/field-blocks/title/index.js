import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

export const registerTitleBlock = () => registerBlockType( 'newspack-blocks/title', {
	title: 'Title',
	category: 'layout',
	parent,
	edit: () => {
		const [ title ] = useEntityProp( 'postType', 'post', 'title' );
		const [ link ] = useEntityProp( 'postType', 'post', 'link' );
		return <div className="wp-block-heading">
			<h2><a href={link}>{ title }</a></h2>
		</div>;
	},
	save: () => null,
	attributes: {},
} );
