/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { BlockList, BlockEditorProvider, InspectorControls } from '@wordpress/block-editor';
import { cloneBlock, serialize } from '@wordpress/blocks';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class Edit extends Component {
	render = () => {
		const { attributes, className, isSelected, query, setAttributes } = this.props;
		const { criteria, blocks, innerBlockAttributes } = attributes;
		return (
			<div className={ className }>
				<InspectorControls>
					<PanelBody title={ __( 'Query Settings' ) } initialOpen={ true }>
						<QueryPanel
							criteria={ criteria }
							onChange={ criteria => setAttributes( { criteria } ) }
						/>
					</PanelBody>
				</InspectorControls>
				{ isSelected && (
					<article className="is-edit-area">
						<BlockEditorProvider value={ blocks } onChange={ blocks => setAttributes( { blocks } ) }>
							<BlockList />
						</BlockEditorProvider>
					</article>
				) }
				<section>
					{ ( query || [] ).map( post => (
						<article>
							{ blocks.map( block => (
								<RawHTML>{ serialize( cloneBlock( block, { post } ) ) }</RawHTML>
							) ) }
						</article>
					) ) }
				</section>
			</div>
		);
	};
}
export default withSelect( ( select, props ) => {
	const { attributes } = props;
	const { criteria } = attributes;
	const { getEntityRecords } = select( 'core' );
	return {
		query: getEntityRecords( 'postType', 'post', criteria ),
	};
} )( Edit );
