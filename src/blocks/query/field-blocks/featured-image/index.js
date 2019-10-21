import { registerBlockType } from '@wordpress/blocks';
import { useEntityProp } from '@wordpress/core-data';
import { withSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

import { name } from '../../index';
const parent = `newspack-blocks/${ name }`;

const Edit = withSelect( select => {
	const { getMedia } = select( 'core' );
	return {
		getMedia,
	}
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
	parent,
	edit: Edit,
	save: () => null,
	attributes: {},
} );;
