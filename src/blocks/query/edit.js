/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InnerBlocks, InspectorControls } from '@wordpress/editor';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

class Edit extends Component {
	render = () => {
		const { attributes, query, setAttributes } = this.props;
		const { criteria } = attributes;
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
				{ !! query && (
					<InnerBlocks
						template={ ( query || [] ).map( post => [
							'newspack-blocks/post',
							{ post },
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
		const query = getEntityRecords( 'postType', 'post', criteria );
		return { query };
	} ),
	withDispatch( ( dispatch, props, registry ) => {
		return {};
	} ),
] )( Edit );
