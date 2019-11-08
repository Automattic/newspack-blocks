import { Path, SVG } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import moment from 'moment';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
	</SVG>
);

export const registerDateBlock = () => registerBlockType( 'newspack-blocks/date', {
	title: 'Date',
	category: 'layout',
	icon,
	parent,
	edit: () => {
		const [ date ] = useEntityProp( 'postType', 'post', 'date_gmt' );
		return (
			<span className="posted-on">
				<time className="entry-date published" key="pub-date">
					{ moment( date )
						.local()
						.format( 'MMMM DD, Y' ) }
				</time>
			</span>
		);
	},
	save: () => null,
} );
