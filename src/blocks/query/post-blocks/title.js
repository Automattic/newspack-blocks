import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerTitleBlock = () =>
	registerBlockType( 'newspack-blocks/title', {
		title: 'Title',
		category: 'layout',
		parent,
		edit: ( props ) => {
			const { currentPost, attributes } = props;
			const thePost = attributes.post ? attributes.post : currentPost;
			return (
				<h1>
					<a href="#">{ thePost.title.raw }</a>
				</h1>
			);
		},
		save: () => null,
		attributes: {
			post: {
				type: 'object',
				default: {
					title: {
						raw: 'Hello World',
					},
				},
			},
		},
	} );

