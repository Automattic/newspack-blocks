/**
 * External dependencies
 */
import classNames from 'classnames';
import moment from 'moment';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import {
	ToggleControl,
	PanelBody,
	PanelRow,
	RangeControl,
	Toolbar,
	Dashicon,
	Placeholder,
	Spinner,
} from '@wordpress/components';
import { BlockControls, InspectorControls } from '@wordpress/editor';

const { decodeEntities } = wp.htmlEntities;

class Edit extends Component {
	render = () => {
		const { attributes, className, setAttributes, setAttributesForLikeSiblings } = this.props;
		const {
			imageScale,
			mediaPosition,
			post,
			showAuthor,
			showAvatar,
			showDate,
			showExcerpt,
			showImage,
			typeScale,
		} = attributes;
		if ( ! post ) return <h4>Post loading...</h4>;
		const classes = classNames( className, {
			[ `type-scale${ typeScale }` ]: typeScale !== '5',
			[ `image-align${ mediaPosition }` ]: mediaPosition !== 'top' && showImage,
			[ `image-scale${ imageScale }` ]: imageScale !== '1' && showImage,
		} );
		return (
			<Fragment>
				<div className={ classes }>
					<article
						className={ post.newspack_featured_image_src && 'post-has-image' }
						key={ post.id }
					>
						{ showImage && post.newspack_featured_image_src && (
							<div className="post-thumbnail" key="thumbnail">
								<img src={ post.newspack_featured_image_src.large } />
							</div>
						) }
						<div className="entry-wrapper">
							<h3 className="entry-title" key="title">
								<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
							</h3>
							{ showExcerpt && <RawHTML key="excerpt">{ post.excerpt.rendered }</RawHTML> }
							<div className="entry-meta">
								{ showAuthor && post.newspack_author_info.avatar && showAvatar && (
									<span className="avatar author-avatar" key="author-avatar">
										<RawHTML>{ post.newspack_author_info.avatar }</RawHTML>
									</span>
								) }

								{ showAuthor && (
									<span className="byline">
										{ __( 'by' ) }{' '}
										<span className="author vcard">
											<a className="url fn n" href="#">
												{ post.newspack_author_info.display_name }
											</a>
										</span>
									</span>
								) }
								{ showDate && (
									<time className="entry-date published" key="pub-date">
										{ moment( post.date_gmt )
											.local()
											.format( 'MMMM DD, Y' ) }
									</time>
								) }
							</div>
						</div>
					</article>
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Featured Image Settings' ) }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Featured Image' ) }
								checked={ showImage }
								onChange={ () => setAttributesForLikeSiblings( { showImage: ! showImage } ) }
							/>
						</PanelRow>
						{ showImage && mediaPosition !== 'top' && (
							<RangeControl
								className="image-scale-slider"
								label={ __( 'Featured Image Scale' ) }
								value={ imageScale }
								onChange={ value => setAttributesForLikeSiblings( { imageScale: value } ) }
								min={ 1 }
								max={ 4 }
								beforeIcon="images-alt2"
								afterIcon="images-alt2"
								required
							/>
						) }
					</PanelBody>
					<PanelBody title={ __( 'Article Control Settings' ) }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Excerpt' ) }
								checked={ showExcerpt }
								onChange={ () => setAttributesForLikeSiblings( { showExcerpt: ! showExcerpt } ) }
							/>
						</PanelRow>
						<RangeControl
							className="type-scale-slider"
							label={ __( 'Type Scale' ) }
							value={ typeScale }
							onChange={ value => setAttributesForLikeSiblings( { typeScale: value } ) }
							min={ 1 }
							max={ 8 }
							beforeIcon="editor-textcolor"
							afterIcon="editor-textcolor"
							required
						/>
					</PanelBody>
					<PanelBody title={ __( 'Article Meta Settings' ) }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Date' ) }
								checked={ showDate }
								onChange={ () => setAttributesForLikeSiblings( { showDate: ! showDate } ) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Author' ) }
								checked={ showAuthor }
								onChange={ () => setAttributesForLikeSiblings( { showAuthor: ! showAuthor } ) }
							/>
						</PanelRow>
						{ showAuthor && (
							<PanelRow>
								<ToggleControl
									label={ __( 'Show Author Avatar' ) }
									checked={ showAvatar }
									onChange={ () => setAttributesForLikeSiblings( { showAvatar: ! showAvatar } ) }
								/>
							</PanelRow>
						) }
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<Toolbar
						controls={ [
							{
								icon: 'align-none',
								title: __( 'Show media on top' ),
								isActive: mediaPosition === 'top',
								onClick: () => setAttributesForLikeSiblings( { mediaPosition: 'top' } ),
							},
							{
								icon: 'align-pull-left',
								title: __( 'Show media on left' ),
								isActive: mediaPosition === 'left',
								onClick: () => setAttributesForLikeSiblings( { mediaPosition: 'left' } ),
							},
							{
								icon: 'align-pull-right',
								title: __( 'Show media on right' ),
								isActive: mediaPosition === 'right',
								onClick: () => setAttributesForLikeSiblings( { mediaPosition: 'right' } ),
							},
						] }
					/>
				</BlockControls>
			</Fragment>
		);
	};
}

export default compose( [
	withSelect( ( select, props ) => {
		const findParentBlock = ( blocks, clientId ) => {
			return blocks.reduce( ( accumulator, block ) => {
				return block.innerBlocks.filter( innerBlock => innerBlock.clientId === clientId ).length > 0
					? block
					: findParentBlock( block.innerBlocks, clientId ) || accumulator;
			}, null );
		};
		const { clientId } = props;
		const { getBlocks } = select( 'core/block-editor' );
		const parentBlock = findParentBlock( getBlocks(), clientId );
		const siblingBlocks = parentBlock.innerBlocks.filter( block => true );
		return { parentBlock, siblingBlocks };
	} ),
	withDispatch( ( dispatch, props ) => {
		const { attributes, parentBlock, siblingBlocks, setAttributes } = props;
		const { updateBlockAttributes } = dispatch( 'core/block-editor' );
		const setAttributesForLikeSiblings = newAttributes => {
			updateBlockAttributes( parentBlock.clientId, {
				postAttributesTemplate: {
					...parentBlock.attributes.postAttributesTemplate,
					...newAttributes,
				},
			} );
			siblingBlocks.forEach( block => {
				updateBlockAttributes( block.clientId, newAttributes );
			} );
		};
		return { setAttributesForLikeSiblings };
	} ),
] )( Edit );
