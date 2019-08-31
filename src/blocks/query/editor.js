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
		return <h1><a href='#'>{ attributes.post.title.raw }</a></h1>;
	},
	save: ( { attributes } ) => {
		return <h1><a href='#'>{ attributes.post.title.raw }</a></h1>;
	},
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


registerBlockType( 'newspack-blocks/excerpt', {
	title: 'Excerpt',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		return <RawHTML>{ attributes.post.excerpt.rendered }</RawHTML>
	},
	save: ( { attributes } ) => {
		return <RawHTML>{ attributes.post.excerpt.rendered }</RawHTML>
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				excerpt: {
					rendered: 'Excerpt...',
				}
			}
		}
	}
} );
