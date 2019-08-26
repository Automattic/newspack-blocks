/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	BlockEditorProvider,
	BlockList,
	InnerBlocks,
	InspectorControls,
	WritingFlow,
} from '@wordpress/block-editor';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { createBlock } from '@wordpress/blocks';

class Edit extends Component {
	componentDidUpdate = prevProps => {
		const { updateInnerBlockAttributes } = this.props;
		const { innerBlockAttributes } = this.props.attributes;
		const { innerBlockAttributes: prevInnerBlockAttributes } = prevProps.attributes;
		if ( prevInnerBlockAttributes !== innerBlockAttributes ) {
			updateInnerBlockAttributes( innerBlockAttributes );
		}
	};
	onBlocksChange = value => {
		const { selectedBlock, hasSelectedBlock } = this.props;
		console.log( value, selectedBlock() );
	}
	render = () => {
		const { attributes, className, query, setAttributes } = this.props;
		const { criteria, innerBlockAttributes } = attributes;
		const blocks = ( query || [] ).map( post =>
			createBlock( 'newspack-blocks/post-bep', { ...innerBlockAttributes, post } )
		);
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
				<div className={ className }>
					<h1>w/Block Editor Provider</h1>
					{ ! query && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ query && ! query.length && <Placeholder>{ __( 'No posts found' ) }</Placeholder> }
					{ query && query.length > 0 && (
						<BlockEditorProvider
							value={ blocks }
							onChange={ this.onBlocksChange }
							onInput={ value => console.log( 'input', value ) }
						>
							<WritingFlow>
								<BlockList />
							</WritingFlow>
						</BlockEditorProvider>
					) }
				</div>
			</Fragment>
		);
	};
}
export default compose( [
	withSelect( ( select, props ) => {
		const { attributes } = props;
		const { criteria } = attributes;
		const { getEntityRecords } = select( 'core' );
		const { getSelectedBlockClientId, getSelectedBlock } = select( 'core/block-editor' );
		const { hasSelectedBlock, getFirstMultiSelectedBlockClientId } = select( 'core/block-editor' );
		return {
			query: getEntityRecords( 'postType', 'post', criteria ),
			selectedBlock: () => getSelectedBlock(),
			hasSelectedBlock: hasSelectedBlock(),
			getFirstMultiSelectedBlockClientId: getFirstMultiSelectedBlockClientId(),
		};
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
