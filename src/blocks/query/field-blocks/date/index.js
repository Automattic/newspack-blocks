import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import moment from 'moment';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

export const registerDateBlock = () => registerBlockType( 'newspack-blocks/date', {
	title: 'Date',
	category: 'layout',
	parent,
	edit: () => {
		const [ date ] = useEntityProp( 'postType', 'post', 'date_gmt' );
		return (
			<time className="entry-date published" key="pub-date">
				{ moment( date )
					.local()
					.format( 'MMMM DD, Y' ) }
			</time>

		);
	},
	save: () => null,
} );




