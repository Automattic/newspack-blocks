/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import {
	BlockList,
	BlockEditorProvider,
	InspectorControls,
	WritingFlow,
} from '@wordpress/block-editor';
import { cloneBlock, serialize } from '@wordpress/blocks';
import { Button, PanelBody } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			editingPost: null,
		};
		this._blocks = props.attributes.blocks;
	}
	render = () => {
		const { attributes, className, isSelected, query, setAttributes } = this.props;
		const { criteria, blocks, innerBlockAttributes } = attributes;
		const { editingPost } = this.state;
		const settings = {
			allowedBlockTypes: [ 'newspack-blocks/title', 'newspack-blocks/excerpt', 'newspack-blocks/author', 'core/paragraph' ],
		};
		const classes = classNames( className, editingPost ? 'is-editing' : '' );
		return (
			<div className={ classes }>
				<InspectorControls>
					<PanelBody title={ __( 'Query Settings' ) } initialOpen={ true }>
						<QueryPanel
							criteria={ criteria }
							onChange={ criteria => setAttributes( { criteria } ) }
						/>
					</PanelBody>
				</InspectorControls>
				<section>
					{ ( query || [] ).map( post => (
						<article className={ post.id === editingPost ? 'is-editing' : '' }>
							{ console.log( 'looped post:', post ) }
							{ post.id === editingPost && (
								<Fragment>
									{ console.log( 'editing post:', post ) }
									<div id="aoeuaoeuaoeu">aoeu aoeu aoeu</div>
									<Button
										onClick={ () => {
											this.setState( { editingPost: null }, () =>
												setAttributes( { blocks: this._blocks } )
											);
										} }
									>
										{ __( 'Save' ) }
									</Button>
									<BlockEditorProvider
										value={ blocks.map( block => cloneBlock( block, { post } ) ) }
										onChange={ blocks => ( this._blocks = blocks ) }
										onEdit={ blocks => ( this._blocks = blocks ) }
										settings={ settings }
									>
										<WritingFlow>
											<BlockList />
										</WritingFlow>
									</BlockEditorProvider>
								</Fragment>
							) }
							{ post.id !== editingPost && (
								<Fragment>
									{ ! editingPost && (
										<Button onClick={ () => this.setState( { editingPost: post.id } ) }>
											{ __( 'Edit' ) }
										</Button>
									) }
									{ blocks.map( block => (
										<RawHTML>{ serialize( cloneBlock( block, { post } ) ) }</RawHTML>
									) ) }
								</Fragment>
							) }
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
