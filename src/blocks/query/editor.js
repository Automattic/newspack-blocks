/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';
import { RawHTML } from '@wordpress/element';
registerBlockType( `newspack-blocks/${ name }`, settings );

const parent = `newspack-blocks/${ name }`;

registerBlockType( 'newspack-blocks/title', {
	title: 'Title',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		return (
			<h1>
				<a href="#">{ attributes.post.title.raw }</a>
			</h1>
		);
	},
	save: ( { attributes } ) => {
		return (
			<h1>
				<a href="#">{ attributes.post.title.raw }</a>
			</h1>
		);
	},
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

registerBlockType( 'newspack-blocks/author', {
	title: 'Author',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		return (
			<h3>
				<a href="#">
					{ attributes.post.newspack_author_info.display_name }
					<RawHTML>{ attributes.post.newspack_author_info.avatar }</RawHTML>
				</a>
			</h3>
		);
	},
	save: ( { attributes } ) => {
		return (
			<h3>
				<a href={ attributes.post.newspack_author_info.author_link }>
					{ attributes.post.newspack_author_info.display_name }
					<RawHTML>{ attributes.post.newspack_author_info.avatar }</RawHTML>
				</a>
			</h3>
		);
	},
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

registerBlockType( 'newspack-blocks/excerpt', {
	title: 'Excerpt',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		return <RawHTML>{ attributes.post.excerpt.rendered }</RawHTML>;
	},
	save: ( { attributes } ) => {
		return <RawHTML>{ attributes.post.excerpt.rendered }</RawHTML>;
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				excerpt: {
					rendered: 'Excerpt...',
				},
			},
		},
	},
} );
