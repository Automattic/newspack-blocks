/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components/';

/**
 * External dependencies
 */
import classNames from 'classnames';
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment as div, RawHTML } from '@wordpress/element';
import {
	BlockList,
	BlockEditorProvider,
	InspectorControls,
	ObserveTyping,
	WritingFlow,
	SlotFillProvider,
	DropZoneProvider,
} from '@wordpress/block-editor';
import { cloneBlock, serialize } from '@wordpress/blocks';
import { Button, PanelBody, Placeholder } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			editingPost: null,
			blocksTree: {},
		};
		this.debouncedCreateBlockTree = debounce( this.createBlockTree.bind( this ), 1000 );
	}
	componentDidMount() {
		this.createBlockTree();
	}
	componentDidUpdate( prevProps ) {
		const { allCategories, allTags, attributes, query } = this.props;
		const { blocks } = attributes;
		if ( prevProps.query !== query ) {
			this.createBlockTree();
		}
	}
	createBlockTree = () => {
		const { editingPost, blocksTree } = this.state;
		const { allCategories, allTags, attributes, query } = this.props;
		const { blocks } = attributes;
		const newBlocksTree = ( query || [] ).reduce(
			( accumulator, post ) => ( {
				...accumulator,
				[ post.id ]:
					post.id === editingPost
						? blocksTree[ post.id ]
						: blocks.map( block => cloneBlock( block, { post, allTags, allCategories } ) ),
			} ),
			{}
		);
		this.setState( { blocksTree: newBlocksTree } );
	};
	cleanBlock = block => {
		const { name, isValid, attributes, innerBlocks } = block;
		return {
			name,
			attributes: { ...attributes, post: {}, allTags: [], allCategories: [] },
			innerBlocks: innerBlocks.map( this.cleanBlock ),
			isValid,
		};
	};
	updateBlocks = ( blocks, postId ) => {
		const { setAttributes } = this.props;
		const { blocksTree } = this.state;
		const cleanBlocks = blocks.map( this.cleanBlock );
		this.setState(
			{ blocksTree: { ...( blocksTree || [] ), [ postId ]: blocks }, editingPost: postId },
			() => {
				setAttributes( { blocks: cleanBlocks } );
				this.debouncedCreateBlockTree();
			}
		);
	};
	render = () => {
		const { attributes, className, query, setAttributes, allTags, allCategories } = this.props;
		const { criteria, blocks } = attributes;
		const { editingPost } = this.state;
		const settings = {
			allowedBlockTypes: [
				'newspack-blocks/author',
				'newspack-blocks/cover-image',
				'newspack-blocks/date',
				'newspack-blocks/excerpt',
				'newspack-blocks/featured-image',
				'newspack-blocks/post-categories',
				'newspack-blocks/tags',
				'newspack-blocks/title',
				'core/paragraph'
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
						<article className={ post.id === editingPost ? 'is-editing' : '' }>e
							{ post.id === editingPost && (
								<div className="block-editor">
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
										value={ blocks.map( block => cloneBlock( block, { post, allTags, allCategories } ) ) }
										onChange={ blocks => ( this._blocks = blocks ) }
										onEdit={ blocks => ( this._blocks = blocks ) }
										settings={ settings }
									>
										<WritingFlow>
											<BlockList />
										</WritingFlow>
									</BlockEditorProvider>
								</div>
							) }
							{ post.id !== editingPost && (
								<div>
									{ ! editingPost && (
										<Button onClick={ () => this.setState( { editingPost: post.id } ) }>
											{ __( 'Edit' ) }
										</Button>
									) }
									{ blocks.map( block => (
										<RawHTML>{ serialize( cloneBlock( block, { post, allTags, allCategories } ) ) }</RawHTML>
									) ) }
								</div>
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
	const taxonomyCriteria = { per_page: -1, hide_empty: true };
	return {
		query: getEntityRecords( 'postType', 'post', criteria ),
		allTags: getEntityRecords( 'taxonomy', 'post_tag', taxonomyCriteria ),
		allCategories: getEntityRecords( 'taxonomy', 'category', taxonomyCriteria ),
	};
} )( Edit );
