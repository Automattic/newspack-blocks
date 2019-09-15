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
	ObserveTyping,
	WritingFlow,
} from '@wordpress/block-editor';
import { cloneBlock, serialize } from '@wordpress/blocks';
import { Button, PanelBody, Placeholder } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			editingPost: null,
			localBlocks: {},
		};
		this._blocks = props.attributes.blocks;
	}
	render = () => {
		const {
			attributes,
			className,
			isSelected,
			query,
			setAttributes,
			allTags,
			allCategories,
		} = this.props;
		const { criteria, blocks, innerBlockAttributes } = attributes;
		const { editingPost, localBlocks } = this.state;
		const settings = {
			allowedBlockTypes: [
				'newspack-blocks/author',
				'newspack-blocks/date',
				'newspack-blocks/excerpt',
				'newspack-blocks/featured-image',
				'newspack-blocks/post-categories',
				'newspack-blocks/post-tags',
				'newspack-blocks/title',
				'core/paragraph',
			],
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
							<Fragment>
								<BlockEditorProvider
									value={
										editingPost === post.id
											? localBlocks
											: blocks.map( block => cloneBlock( block, { post, allTags, allCategories } ) )
									}
									onChange={ blocks => {
										console.log( 'change' );
										this.setState( { editingPost: post.id, localBlocks: blocks }, () =>
											setAttributes( { blocks } )
										);
									} }
									onInput={ blocks => {
										console.log( 'INPUT' );
										this.setState( { editingPost: post.id, localBlocks: blocks }, () =>
											setAttributes( { blocks } )
										);
									} }
									settings={ settings }
								>
									<WritingFlow>
										<BlockList />
									</WritingFlow>
								</BlockEditorProvider>
							</Fragment>
						</article>
					) ) }
					{ ( ! query || ! query.length ) && <Placeholder>{ __( 'Loading posts' ) }</Placeholder> }
				</section>
			</div>
		);
	};
}
export default withSelect( ( select, props ) => {
	const { attributes } = props;
	const { criteria } = attributes;
	const { getEntityRecords } = select( 'core' );
	const taxonomyCriteria = { per_page: -1, hide_empty: true };
	return {
		query: getEntityRecords( 'postType', 'post', criteria ),
		allTags: getEntityRecords( 'taxonomy', 'post_tag', taxonomyCriteria ),
		allCategories: getEntityRecords( 'taxonomy', 'category', taxonomyCriteria ),
	};
} )( Edit );
