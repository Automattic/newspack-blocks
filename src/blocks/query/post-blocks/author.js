import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerAuthorBlock = () => registerBlockType( 'newspack-blocks/author', {
	title: 'Author',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { post } = attributes;
		return (
			<h3>
				<span className="byline">
					{ __( 'by' ) }{' '}
					<span className="author vcard">
						<a className="url fn n" href="#">
							{ post.newspack_author_info.display_name }
						</a>
					</span>
				</span>
				<RawHTML>{ post.newspack_author_info.avatar }</RawHTML>
			</h3>
		);
	},
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
