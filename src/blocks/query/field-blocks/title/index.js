import { registerBlockType } from '@wordpress/blocks';
import { RawHTML } from '@wordpress/element';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

export const registerTitleBlock = () => registerBlockType( 'newspack-blocks/title', {
	title: 'Title',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { currentPost, attributes } = props;
		const thePost = attributes.post ? attributes.post : currentPost;
		return <div className="wp-block-heading">
			<h2><a href={thePost.link}>{ thePost.title.raw }</a></h2>
		</div>;
	},
	save: () => null,
	attributes: {
		post: {
			type: 'object',
			default: {
				title: {
					raw: "Hello World"
				}
			}
		}
	}
} );
