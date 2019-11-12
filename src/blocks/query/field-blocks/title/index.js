import { Path, SVG } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M5 4v3h5.5v12h3V7H19V4z" />
	</SVG>
);

export const registerTitleBlock = () => registerBlockType( 'newspack-blocks/title', {
	title: 'Title',
	category: 'layout',
	icon,
	parent,
	edit: () => {
		const [ title, setTitle ] = useEntityProp( 'postType', 'post', 'title' );
		const [ link ] = useEntityProp( 'postType', 'post', 'link' );
		return <h2 className="entry-title"><a href={ link }>{ title }</a></h2>;
	},
	save: () => null,
	attributes: {},
} );
