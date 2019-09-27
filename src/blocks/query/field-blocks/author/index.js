import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const Edit = ( { attributes } ) => {
	const [ newspack_author_info ] = useEntityProp( 'postType', 'post', 'author' );
	console.log( newspack_author_info );
	return (
		<h3>
			<span className="byline">
				{ __( 'by' ) }{' '}
				<span className="author vcard">
					<a className="url fn n" href="#">
						{ newspack_author_info.display_name }
					</a>
				</span>
			</span>
			<RawHTML>{ newspack_author_info.avatar }</RawHTML>
		</h3>
	);
}

export const registerAuthorBlock = () => registerBlockType( 'newspack-blocks/author', {
	title: 'Author',
	category: 'layout',
	parent,
	edit: Edit,
	save: () => null,
	attributes: {
		post: {
			type: 'object',
			default: {
				newspack_author_info: {
					author_link: '#',
					avatar: '',
					display_name: 'William Shakespeare',
				},
			},
		},
	},
} );
