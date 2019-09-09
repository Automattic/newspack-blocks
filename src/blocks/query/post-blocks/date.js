import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import moment from 'moment';

import { name } from '../index';
const parent = `newspack-blocks/${ name }`;

export const registerDateBlock = () => registerBlockType( 'newspack-blocks/date', {
	title: 'Date',
	category: 'layout',
	parent,
	edit: ( { attributes } ) => {
		const { post } = attributes;
		return (
			<time className="entry-date published" key="pub-date">
				{ moment( post.date_gmt )
					.local()
					.format( 'MMMM DD, Y' ) }
			</time>

		);
	},
	save: ( { attributes } ) => {
		const { post } = attributes;
		return (
			<time className="entry-date published" key="pub-date">
				{ moment( post.date_gmt )
					.local()
					.format( 'MMMM DD, Y' ) }
			</time>

		);
	},
	attributes: {
		post: {
			type: 'object',
			default: {
				date_gmt: '1970-01-01 01:23:45'
			},
		},
	},
} );




