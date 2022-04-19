/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { CheckboxControl, PanelBody, PanelRow } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

export const PostTypesPanel = ( { attributes, setAttributes } ) => {
	const { availablePostTypes } = useSelect( select => {
		const { getPostTypes } = select( 'core' );
		return {
			availablePostTypes: getPostTypes( { per_page: -1 } )?.filter(
				( { supports: { newspack_blocks: newspackBlocks } } ) => newspackBlocks
			),
		};
	} );

	return (
		<PanelBody title={ __( 'Post Types', 'newspack-blocks' ) }>
			{ availablePostTypes &&
				availablePostTypes.map( ( { name, slug } ) => (
					<PanelRow key={ slug }>
						<CheckboxControl
							label={ name }
							checked={ attributes.postType.indexOf( slug ) > -1 }
							onChange={ value => {
								const cleanPostType = [ ...new Set( attributes.postType ) ];
								if ( value && cleanPostType.indexOf( slug ) === -1 ) {
									cleanPostType.push( slug );
								} else if ( ! value && cleanPostType.indexOf( slug ) > -1 ) {
									cleanPostType.splice( cleanPostType.indexOf( slug ), 1 );
								}
								setAttributes( {
									postType: cleanPostType,
								} );
							} }
						/>
					</PanelRow>
				) ) }
		</PanelBody>
	);
};

