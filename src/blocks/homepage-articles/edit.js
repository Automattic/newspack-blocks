/**
 * Internal dependencies
 */
import QueryControls from './query-controls';

/**
 * External dependencies
 */
import classNames from 'classnames';
import { isUndefined, pickBy } from 'lodash';
import moment from 'moment';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { InspectorControls, RichText, BlockControls } from '@wordpress/editor';
import {
	PanelBody,
	PanelRow,
	RangeControl,
	Toolbar,
	ToggleControl,
	Dashicon,
	Placeholder,
	Spinner,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { withState } from '@wordpress/compose';

const { decodeEntities } = wp.htmlEntities;

/**
 * Module Constants
 */
const MAX_POSTS_COLUMNS = 6;

class Edit extends Component {
	renderPost = post => {
		const { attributes } = this.props;
		const {
			showImage,
			showCaption,
			showExcerpt,
			showAuthor,
			showAvatar,
			showDate,
			sectionHeader,
		} = attributes;
		return (
			<article className={ post.newspack_featured_image_src && 'post-has-image' } key={ post.id }>
				{ showImage && post.newspack_featured_image_src && (
					<figure className="post-thumbnail" key="thumbnail">
						<a href="#">
							<img src={ post.newspack_featured_image_src.large } />
						</a>
						{ showCaption && '' !== post.newspack_featured_image_caption && (
							<figcaption>{ post.newspack_featured_image_caption }</figcaption>
						) }
					</figure>
				) }
				<div className="entry-wrapper">
					{ RichText.isEmpty( sectionHeader ) ? (
						<h2 className="entry-title" key="title">
							<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
						</h2>
					) : (
						<h3 className="entry-title" key="title">
							<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
						</h3>
					) }
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
		);
	};

	renderInspectorControls = () => {
		const {
			attributes,
			authorList,
			categoriesList,
			tagsList,
			postList,
			setAttributes,
			latestPosts,
			isSelected,
		} = this.props;
		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		const {
			author,
			single,
			postsToShow,
			categories,
			sectionHeader,
			columns,
			showImage,
			showCaption,
			imageScale,
			showExcerpt,
			typeScale,
			showDate,
			showAuthor,
			showAvatar,
			postLayout,
			mediaPosition,
			singleMode,
			tags,
		} = attributes;
		return (
			<Fragment>
				<PanelBody title={ __( 'Display Settings' ) } initialOpen={ true }>
					{ postsToShow && categoriesList && (
						<QueryControls
							numberOfItems={ postsToShow }
							onNumberOfItemsChange={ value => setAttributes( { postsToShow: value } ) }
							authorList={ authorList }
							postList={ postList }
							tagsList={ tagsList }
							singleMode={ singleMode }
							categoriesList={ categoriesList }
							selectedCategoryId={ categories }
							selectedAuthorId={ author }
							selectedTagId={ tags }
							selectedSingleId={ single }
							onCategoryChange={ value =>
								setAttributes( { categories: '' !== value ? value : undefined } )
							}
							onTagChange={ value => setAttributes( { tags: '' !== value ? value : undefined } ) }
							onAuthorChange={ value =>
								setAttributes( { author: '' !== value ? value : undefined } )
							}
							onSingleChange={ value =>
								setAttributes( { single: '' !== value ? value : undefined } )
							}
							onSingleModeChange={ value => setAttributes( { singleMode: value } ) }
						/>
					) }
					{ postLayout === 'grid' && (
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ value => setAttributes( { columns: value } ) }
							min={ 2 }
							max={
								! hasPosts ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, latestPosts.length )
							}
							required
						/>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Featured Image Settings' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Featured Image' ) }
							checked={ showImage }
							onChange={ () => setAttributes( { showImage: ! showImage } ) }
						/>
					</PanelRow>
					{ showImage && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Featured Image Caption' ) }
								checked={ showCaption }
								onChange={ () => setAttributes( { showCaption: ! showCaption } ) }
							/>
						</PanelRow>
					) }

					{ showImage && mediaPosition !== 'top' && (
						<RangeControl
							className="image-scale-slider"
							label={ __( 'Featured Image Scale' ) }
							value={ imageScale }
							onChange={ value => setAttributes( { imageScale: value } ) }
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
							onChange={ () => setAttributes( { showExcerpt: ! showExcerpt } ) }
						/>
					</PanelRow>
					<RangeControl
						className="type-scale-slider"
						label={ __( 'Type Scale' ) }
						value={ typeScale }
						onChange={ value => setAttributes( { typeScale: value } ) }
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
							onChange={ () => setAttributes( { showDate: ! showDate } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Author' ) }
							checked={ showAuthor }
							onChange={ () => setAttributes( { showAuthor: ! showAuthor } ) }
						/>
					</PanelRow>
					{ showAuthor && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Author Avatar' ) }
								checked={ showAvatar }
								onChange={ () => setAttributes( { showAvatar: ! showAvatar } ) }
							/>
						</PanelRow>
					) }
				</PanelBody>
			</Fragment>
		);
	};

	render() {
		/**
		 * Constants
		 */
		const {
			attributes,
			className,
			setAttributes,
			isSelected,
			latestPosts,
			hasPosts,
			categoriesList,
		} = this.props; // variables getting pulled out of props
		const {
			showExcerpt,
			showDate,
			showImage,
			showAuthor,
			showAvatar,
			postsToShow,
			postLayout,
			mediaPosition,
			columns,
			categories,
			typeScale,
			imageScale,
			sectionHeader,
		} = attributes;

		const classes = classNames( className, {
			'is-grid': postLayout === 'grid',
			'show-image': showImage,
			[ `columns-${ columns }` ]: postLayout === 'grid',
			[ `type-scale${ typeScale }` ]: typeScale !== '5',
			[ `image-align${ mediaPosition }` ]: showImage,
			[ `image-scale${ imageScale }` ]: imageScale !== '1' && showImage,
		} );

		const blockControls = [
			{
				icon: 'list-view',
				title: __( 'List View' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid View' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		const blockControlsImages = [
			{
				icon: 'align-none',
				title: __( 'Show media on top' ),
				isActive: mediaPosition === 'top',
				onClick: () => setAttributes( { mediaPosition: 'top' } ),
			},
			{
				icon: 'align-pull-left',
				title: __( 'Show media on left' ),
				isActive: mediaPosition === 'left',
				onClick: () => setAttributes( { mediaPosition: 'left' } ),
			},
			{
				icon: 'align-pull-right',
				title: __( 'Show media on right' ),
				isActive: mediaPosition === 'right',
				onClick: () => setAttributes( { mediaPosition: 'right' } ),
			},
		];

		return (
			<Fragment>
				<div className={ classes }>
					{ latestPosts && ( ! RichText.isEmpty( sectionHeader ) || isSelected ) && (
						<RichText
							onChange={ value => setAttributes( { sectionHeader: value } ) }
							placeholder={ __( 'Write header…' ) }
							value={ sectionHeader }
							tagName="h2"
							className="article-section-title"
						/>
					) }
					{ latestPosts && ! latestPosts.length && (
						<Placeholder>{ __( 'Sorry, no posts were found.' ) }</Placeholder>
					) }
					{ ! latestPosts && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ latestPosts && latestPosts.map( post => this.renderPost( post ) ) }
				</div>
				<BlockControls>
					<Toolbar controls={ blockControls } />
					{ showImage && <Toolbar controls={ blockControlsImages } /> }
				</BlockControls>
				<InspectorControls>{ this.renderInspectorControls() }</InspectorControls>
			</Fragment>
		);
	}
}

export default withSelect( ( select, props ) => {
	const { postsToShow, author, categories, tags, single, singleMode } = props.attributes;
	const { getAuthors, getEntityRecords } = select( 'core' );
	const latestPostsQuery = pickBy(
		singleMode
			? { include: single }
			: {
					per_page: postsToShow,
					categories,
					author,
					tags,
			  },
		value => ! isUndefined( value )
	);
	const categoriesListQuery = {
		per_page: 100,
	};
	const tagsListQuery = {
		per_page: 1000,
	};
	const postsListQuery = {
		per_page: 50,
	};
	return {
		latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
		categoriesList: getEntityRecords( 'taxonomy', 'category', categoriesListQuery ),
		tagsList: getEntityRecords( 'taxonomy', 'post_tag', tagsListQuery ),
		authorList: getAuthors(),
		postList: getEntityRecords( 'postType', 'post', postsListQuery ),
	};
} )( Edit );
