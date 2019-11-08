import { Path, SVG } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { RawHTML } from '@wordpress/element';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M4 9h16v2H4zm0 4h10v2H4z" />
	</SVG>
);

export const registerExcerptBlock = () => registerBlockType( 'newspack-blocks/excerpt', {
	title: 'Excerpt',
	category: 'layout',
	icon,
	parent,
	edit: ( ) => {
		const [ excerpt ] = useEntityProp( 'postType', 'post', 'excerpt' );
		return <RawHTML>{ excerpt }</RawHTML>
	},
	save: () => null,
} );
