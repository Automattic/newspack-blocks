import { Path, SVG } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
	</SVG>
);

const Edit = withSelect( select => {
	const { getMedia } = select( 'core' );
	return { getMedia }
} )( ( { attributes, getMedia } ) => {
	const [ featuredImageId ] = useEntityProp( 'postType', 'post', 'featured_media' );
	if ( ! featuredImageId ) {
		return null;
	}
	const featuredImage = getMedia( featuredImageId );
	const thumbnail = (featuredImage && featuredImage.media_details && featuredImage.media_details.sizes && featuredImage.media_details.sizes.thumbnail || null );
	if ( ! thumbnail ) {
		return null;
	}
	return (
		<img src={ thumbnail.source_url } width={ thumbnail.width } height={ thumbnail.height} />
	)
} )

export const registerFeaturedImageBlock = () => registerBlockType( 'newspack-blocks/featured-image', {
	title: 'Featured Image',
	category: 'layout',
	icon,
	parent,
	edit: Edit,
	save: () => null,
	attributes: {},
} );;
