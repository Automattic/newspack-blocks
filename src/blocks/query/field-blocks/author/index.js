import { Path, SVG } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { name } from '../../index';
import './author.scss';
const parent = `newspack-blocks/${ name }`;

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
	</SVG>
);

const Edit = ( { attributes } ) => {
	const [ newspack_author_info ] = useEntityProp( 'postType', 'post', 'newspack_author_info' );

	return (
		<div class="article-section-author">
			<RawHTML>{ ( newspack_author_info || {} ).avatar }</RawHTML>
			<span className="byline">
				{ __( 'by' ) }{' '}
				<span className="author vcard">
					<a className="url fn n" href="#">
						{ ( newspack_author_info || {} ).display_name }
					</a>
				</span>
			</span>
		</div>
	);
}

export const registerAuthorBlock = () => registerBlockType( 'newspack-blocks/author', {
	title: 'Author',
	category: 'layout',
	icon,
	parent,
	edit: Edit,
	save: () => null,
} );
