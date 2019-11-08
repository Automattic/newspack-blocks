import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { name } from '../../index';
import './author.scss';
const parent = `newspack-blocks/${ name }`;

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
	parent,
	edit: Edit,
	save: () => null,
} );
