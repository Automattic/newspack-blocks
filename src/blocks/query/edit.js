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
import { Component, Fragment } from '@wordpress/element';
import {
	BlockList,
	BlockEditorProvider,
	InspectorControls,
	WritingFlow,
} from '@wordpress/block-editor';
import { cloneBlock } from '@wordpress/blocks';
import { PanelBody } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { EntityProvider } from '@wordpress/core-data';
import { withSelect, withDispatch } from '@wordpress/data';

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
			updateCriteria
		} = this.props;

		const { criteria } = attributes;

		if ( ! query ) {
			updateCriteria( clientId, criteria );
			return null;
		}

		const { editingPost, blocksTree } = this.state;
		const settings = {};
		const classes = classNames( className, editingPost ? 'is-editing' : '' );

		return (
			<div className={ classes }>
				<InspectorControls>
					<PanelBody title={ __( 'Query Settings' ) } initialOpen={ true }>
						<QueryPanel
							criteria={ criteria }
							onChange={ criteria => {
								setAttributes( { criteria } );
								updateCriteria( clientId, criteria );
							} } />
					</PanelBody>
				</InspectorControls>
				<Fragment>
					{ ( query || [] ).map( post => {
						if ( ! blocksTree[ post.id ] ) return null;

						return <article className={ post.id === editingPost ? 'is-editing' : '' } key={ post.id }>
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
		const displayedPostCount = select( 'newspack-blocks/query' ).countPostsInEarlierBlocks( clientId );
		const shadowCritera = {
			...criteria,
			per_page: 0 + criteria.per_page + displayedPostCount
		}

		return {
			query: select( 'newspack-blocks/query' ).query( clientId, shadowCritera ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { updateCriteria } = dispatch( 'newspack-blocks/query' );
		return { updateCriteria };
	} )
)( Edit );

