/**
 * Internal dependencies
 */
import { QueryPanel } from '../../components';

/**
 * External dependencies
 */
import classNames from 'classnames';
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import {
	BlockList,
	BlockEditorProvider,
	InspectorControls,
	WritingFlow,
} from '@wordpress/block-editor';
import { cloneBlock, createBlock } from '@wordpress/blocks';
import { PanelBody, Placeholder, Spinner } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { EntityProvider } from '@wordpress/core-data';
import { withSelect, withDispatch } from '@wordpress/data';

const defaultFields = [ 'newspack-blocks/title', 'newspack-blocks/date', 'newspack-blocks/author' ];

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			editingPost: null,
			blocksTree: {},
		};
		// this.props.updateCriteria( this.props.clientId, this.props.attributes.criteria );
		this.debouncedCreateBlockTree = debounce( this.createBlockTree.bind( this ), 1000 );
	}

	componentDidMount() {
		this.createBlockTree();
		this.updateBlocks( defaultFields.map( f => createBlock( f ) ) );
	}

	componentDidUpdate( prevProps ) {
		const { query } = this.props;
		if ( prevProps.query !== query ) {
			this.createBlockTree();
		}
	}

	createBlockTree = () => {
		const { editingPost, blocksTree } = this.state;
		const { attributes, query } = this.props;
		const { blocks } = attributes;
		const newBlocksTree = ( query || [] ).reduce(
			( accumulator, post ) => ( {
				...accumulator,
				[ post.id ]:
					post.id === editingPost
						? blocksTree[ post.id ]
						: blocks.map( block => cloneBlock( block, { post } ) ),
			} ),
			{}
		);
		this.setState( { blocksTree: newBlocksTree } );
	};

	cleanBlock = block => {
		const { name, isValid, attributes, innerBlocks } = block;
		return {
			name,
			attributes: { ...attributes, post: {} },
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
		const {
			attributes,
			className,
			query,
			setAttributes,
			clientId,
			postList,
			markPostsAsDisplayed,
		} = this.props;

		const { criteria } = attributes;

		const { editingPost, blocksTree } = this.state;
		const settings = {};
		const classes = classNames( className, editingPost ? 'is-editing' : '' );
		markPostsAsDisplayed( clientId, query );

		return (
			<div className={ classes }>
				<InspectorControls>
					<PanelBody title={ __( 'Query Settings' ) } initialOpen={ true }>
						<QueryPanel
							criteria={ criteria }
							postList={ postList }
							onChange={ criteria => {
								setAttributes( { criteria } );
								// updateCriteria( clientId, criteria );
							} }
						/>
					</PanelBody>
				</InspectorControls>
				<Fragment>
					{ ! query && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ query && ! query.length && (
						<Placeholder>{ __( 'Sorry, no posts were found.', 'newspack-blocks' ) }</Placeholder>
					) }
					{ query &&
						!! query.length &&
						query.map( post => {
							if ( ! blocksTree[ post.id ] ) return null;
							return (
								<article className={ post.id === editingPost ? 'is-editing' : '' } key={ post.id }>
									<EntityProvider kind="postType" type="post" id={ post.id }>
										<BlockEditorProvider
											value={ blocksTree[ post.id ] }
											onChange={ blocks => this.updateBlocks( blocks, post.id ) }
											settings={ settings }
										>
											<WritingFlow>
												<BlockList />
											</WritingFlow>
										</BlockEditorProvider>
									</EntityProvider>
								</article>
							);
						} ) }
				</Fragment>
			</div>
		);
	};
}

export default compose(
	withSelect( ( select, props ) => {
		const { attributes, clientId } = props;
		const { criteria } = attributes;

		if ( ! criteria.singleMode ) {
			const postIdsToExclude = select( 'newspack-blocks/post-deduplication' ).previousPostIds(
				clientId
			);
			criteria.exclude = postIdsToExclude.join( ',' );
		}

		return {
			query: select( 'core' ).getEntityRecords( 'postType', 'post', { ...criteria } ),
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const { attributes } = props;
		const { criteria } = attributes;
		const markPostsAsDisplayed = criteria.singleMode
			? dispatch( 'newspack-blocks/post-deduplication' ).markSpecificPostsAsDisplayed
			: dispatch( 'newspack-blocks/post-deduplication' ).markPostsAsDisplayed;

		return {
			markPostsAsDisplayed,
		};
	} )
)( Edit );
