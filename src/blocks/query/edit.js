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
import { Component, Fragment, RawHTML } from '@wordpress/element';
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
			localBlocks: {},
			blocksTree: {},
		};
		this.debouncedCreateBlockTree = debounce( this.createBlockTree.bind( this ), 250 );
		this._isMounted = false;
	}
	componentDidMount() {
		this._isMounted = true;
	}
	componentDidUpdate( prevProps ) {
		const { allCategories, allTags, attributes, query } = this.props;
		const { blocks } = attributes;
		if ( prevProps.query !== query ) {
			this.createBlockTree();
		}
	}
	componentWillUnmount() {
		this._isMounted = false;
	}
	createBlockTree = () => {
		if ( ! this._isMounted ) {
			return;
		}
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
	updateBlocks = ( blocks, postId ) => {
		if ( ! this._isMounted ) {
			return;
		}
		const { setAttributes } = this.props;
		const { blocksTree } = this.state;
		this.setState(
			{ blocksTree: { ...blocksTree, [ postId ]: blocks }, editingPost: postId },
			() => {
				setAttributes( { blocks } );
				this.debouncedCreateBlockTree();
			}
		);
	};
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
		const { editingPost, localBlocks, blocksTree } = this.state;
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
									value={ blocksTree[ post.id ] }
									onChange={ blocks => this.updateBlocks( blocks, post.id ) }
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
