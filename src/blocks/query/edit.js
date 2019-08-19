/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class Edit extends Component {
	componentDidUpdate = prevProps => {
		const { updateInnerBlockAttributes } = this.props;
		const { innerBlockAttributes } = this.props.attributes;
		const { innerBlockAttributes: prevInnerBlockAttributes } = prevProps.attributes;
		if ( prevInnerBlockAttributes !== innerBlockAttributes ) {
			updateInnerBlockAttributes( innerBlockAttributes );
		}
	};
	render = () => {
		const { attributes, query, setAttributes } = this.props;
		const { criteria, innerBlockAttributes } = attributes;
		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Query Settings' ) } initialOpen={ true }>
						<QueryPanel
							criteria={ criteria }
							onChange={ criteria => setAttributes( { criteria } ) }
						/>
					</PanelBody>
				</InspectorControls>
				{ ! query && (
					<Placeholder>
						<Spinner />
					</Placeholder>
				) }
				{ query && ! query.length && <Placeholder>{ __( 'No posts found' ) }</Placeholder> }
				{ query && query.length > 0 && (
					<InnerBlocks
						template={ ( query || [] ).map( post => [
							'newspack-blocks/post',
							{ ...innerBlockAttributes, post },
						] ) }
						templateInsertUpdatesSelection={ false }
						templateLock="all"
					/>
				) }
			</Fragment>
		);
	};
}
export default compose( [
	withSelect( ( select, props ) => {
		const { attributes } = props;
		const { criteria } = attributes;
		const { getEntityRecords } = select( 'core' );
		return { query: getEntityRecords( 'postType', 'post', criteria ) };
	} ),
	withDispatch( ( dispatch, props, registry ) => {
		const { clientId } = props;
		const { updateBlockAttributes } = dispatch( 'core/block-editor' );
		const { getBlock } = registry.select( 'core/block-editor' );
		return {
			updateInnerBlockAttributes: attributes => {
				const { innerBlocks } = getBlock( clientId );
				innerBlocks.forEach( innerBlock =>
					updateBlockAttributes( innerBlock.clientId, attributes )
				);
			},
		};
	} ),
] )( Edit );
