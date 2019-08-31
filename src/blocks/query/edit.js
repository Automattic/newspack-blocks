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

const PROTOTYPE_STYLE = 1;

class Edit extends Component {
	render = () => {
		const { attributes, className, isSelected, query, setAttributes } = this.props;
		const { criteria, blocks, innerBlockAttributes } = attributes;
		const settings = {
			allowedBlockTypes: [ 'newspack-blocks/title', 'newspack-blocks/excerpt' ],
		};
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
				{ isSelected && PROTOTYPE_STYLE === 0 && (
					<article className="is-edit-area">
						<BlockEditorProvider
							value={ blocks }
							onChange={ blocks => setAttributes( { blocks } ) }
						>
							<BlockList />
						</BlockEditorProvider>
					</article>
				) }
				{ PROTOTYPE_STYLE === 0 && (
					<section>
						{ ( query || [] ).map( post => (
							<article>
								{ blocks.map( block => (
									<RawHTML>{ serialize( cloneBlock( block, { post } ) ) }</RawHTML>
								) ) }
							</article>
						) ) }
					</section>
				) }
				{ PROTOTYPE_STYLE === 1 && (
					<section>
						{ ( query || [] ).map( post => (
							<article>
								<BlockEditorProvider
									value={ blocks.map( block => cloneBlock( block, { post } ) ) }
									onChange={ blocks => setAttributes( { blocks } ) }
									settings={ settings }
								>
									<BlockList />
								</BlockEditorProvider>
							</article>
						) ) }
					</section>
				) }
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
