/**
 * Internal dependencies
 */
import QueryControls from './query-controls';
import AutocompleteTokenField from './components/autocomplete-tokenfield.js';

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
	BaseControl,
	Path,
	SVG,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { decodeEntities } from '@wordpress/html-entities';
import { PanelColorSettings, withColors } from '@wordpress/block-editor';

/**
 * Module Constants
 */
const MAX_POSTS_COLUMNS = 6;

/* From https://material.io/tools/icons */
const landscapeIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z" />
	</SVG>
);

const portraitIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" />
	</SVG>
);

const squareIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z" />
	</SVG>
);

const uncroppedIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z" />
	</SVG>
);

const coverIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path d="M0 0h24v24H0z" fill="none" />
		<Path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
	</SVG>
);

class Edit extends Component {
	renderPost = post => {
		const { attributes } = this.props;
		const {
			showImage,
			imageShape,
			imageFileSize,
			showCaption,
			showExcerpt,
			showAuthor,
			showAvatar,
			showDate,
			showCategory,
			sectionHeader,
		} = attributes;
		return (
			<article className={ post.newspack_featured_image_src && 'post-has-image' } key={ post.id }>
				{ showImage && post.newspack_featured_image_src && (
					<figure className="post-thumbnail" key="thumbnail">
						<a href="#">
							{ imageShape === 'landscape' && (
								<img src={ post.newspack_featured_image_src.landscape } />
							) }
							{ imageShape === 'portrait' && (
								<img src={ post.newspack_featured_image_src.portrait } />
							) }
							{ imageShape === 'square' && <img src={ post.newspack_featured_image_src.square } /> }

							{ imageShape === 'uncropped' && (
								<img src={ post.newspack_featured_image_src.uncropped } />
							) }
						</a>
						{ showCaption && '' !== post.newspack_featured_image_caption && (
							<figcaption>{ post.newspack_featured_image_caption }</figcaption>
						) }
					</figure>
				) }
				<div className="entry-wrapper">
					{ showCategory && post.newspack_category_info.length && (
						<div className="cat-links">
							<a href="#">{ post.newspack_category_info }</a>
						</div>
					) }
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
								{ __( 'by', 'newspack-blocks' ) }{' '}
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
			postList,
			setAttributes,
			latestPosts,
			isSelected,
			textColor,
			setTextColor,
		} = this.props;
		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
		const {
			authors,
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
			showCategory,
			postLayout,
			mediaPosition,
			singleMode,
			tags,
			url,
		} = attributes;

		const fetchAuthorSuggestions = search => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/users', {
					search,
					per_page: 20,
					_fields: 'id,name',
				} ),
			} ).then( function( users ) {
				return users.map( user => ( {
					value: user.id,
					label: decodeEntities( user.name ) || __( '(no name)', 'newspack-blocks' ),
				} ) );
			} );
		};
		const fetchSavedAuthors = userIDs => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/users', {
					per_page: 100,
					include: userIDs.join( ',' ),
				} ),
			} ).then( function( users ) {
				return users.map( user => ( {
					value: user.id,
					label: decodeEntities( user.name ) || __( '(no name)', 'newspack-blocks' ),
				} ) );
			} );
		};

		const fetchCategorySuggestions = search => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/categories', {
					search,
					per_page: 20,
					_fields: 'id,name',
					orderby: 'count',
					order: 'desc',
				} ),
			} ).then( function( categories ) {
				return categories.map( category => ( {
					value: category.id,
					label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
				} ) );
			} );
		};
		const fetchSavedCategories = categoryIDs => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/categories', {
					per_page: 100,
					_fields: 'id,name',
					include: categoryIDs.join( ',' ),
				} ),
			} ).then( function( categories ) {
				return categories.map( category => ( {
					value: category.id,
					label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
				} ) );
			} );
		};

		const fetchTagSuggestions = search => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/tags', {
					search,
					per_page: 20,
					_fields: 'id,name',
					orderby: 'count',
					order: 'desc',
				} ),
			} ).then( function( tags ) {
				return tags.map( tag => ( {
					value: tag.id,
					label: decodeEntities( tag.name ) || __( '(no title)', 'newspack-blocks' ),
				} ) );
			} );
		};
		const fetchSavedTags = tagIDs => {
			return apiFetch( {
				path: addQueryArgs( '/wp/v2/tags', {
					per_page: 100,
					_fields: 'id,name',
					include: tagIDs.join( ',' ),
				} ),
			} ).then( function( tags ) {
				return tags.map( tag => ( {
					value: tag.id,
					label: decodeEntities( tag.name ) || __( '(no title)', 'newspack-blocks' ),
				} ) );
			} );
		};

		return (
			<Fragment>
				<PanelBody title={ __( 'Display Settings', 'newspack-blocks' ) } initialOpen={ true }>
					{ postsToShow && (
						<Fragment>
							<QueryControls
								numberOfItems={ postsToShow }
								onNumberOfItemsChange={ value => setAttributes( { postsToShow: value } ) }
								postList={ postList }
								singleMode={ singleMode }
								selectedSingleId={ single }
								onSingleChange={ value =>
									setAttributes( { single: '' !== value ? value : undefined } )
								}
								onSingleModeChange={ value => setAttributes( { singleMode: value } ) }
							/>
							{ ! singleMode && (
								<Fragment>
									<BaseControl>
										<AutocompleteTokenField
											tokens={ authors || [] }
											onChange={ tokens => setAttributes( { authors: tokens } ) }
											fetchSuggestions={ fetchAuthorSuggestions }
											fetchSavedInfo={ fetchSavedAuthors }
											label={ __( 'Author', 'newspack-blocks' ) }
										/>
									</BaseControl>
									<BaseControl>
										<AutocompleteTokenField
											tokens={ categories || [] }
											onChange={ tokens => setAttributes( { categories: tokens } ) }
											fetchSuggestions={ fetchCategorySuggestions }
											fetchSavedInfo={ fetchSavedCategories }
											label={ __( 'Category', 'newspack-blocks' ) }
										/>
									</BaseControl>
									<BaseControl>
										<AutocompleteTokenField
											tokens={ tags || [] }
											onChange={ tokens => setAttributes( { tags: tokens } ) }
											fetchSuggestions={ fetchTagSuggestions }
											fetchSavedInfo={ fetchSavedTags }
											label={ __( 'Tag', 'newspack-blocks' ) }
										/>
									</BaseControl>
								</Fragment>
							) }
						</Fragment>
					) }
					{ postLayout === 'grid' && (
						<RangeControl
							label={ __( 'Columns', 'newspack-blocks' ) }
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
				<PanelBody title={ __( 'Featured Image Settings', 'newspack-blocks' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Featured Image', 'newspack-blocks' ) }
							checked={ showImage }
							onChange={ () => setAttributes( { showImage: ! showImage } ) }
						/>
					</PanelRow>

					{ showImage && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Featured Image Caption', 'newspack-blocks' ) }
								checked={ showCaption }
								onChange={ () => setAttributes( { showCaption: ! showCaption } ) }
							/>
						</PanelRow>
					) }

					{ showImage && mediaPosition !== 'top' && mediaPosition !== 'behind' && (
						<RangeControl
							className="image-scale-slider"
							label={ __( 'Featured Image Scale', 'newspack-blocks' ) }
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
				<PanelBody title={ __( 'Article Control Settings', 'newspack-blocks' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Excerpt', 'newspack-blocks' ) }
							checked={ showExcerpt }
							onChange={ () => setAttributes( { showExcerpt: ! showExcerpt } ) }
						/>
					</PanelRow>
					<RangeControl
						className="type-scale-slider"
						label={ __( 'Type Scale', 'newspack-blocks' ) }
						value={ typeScale }
						onChange={ value => setAttributes( { typeScale: value } ) }
						min={ 1 }
						max={ 10 }
						beforeIcon="editor-textcolor"
						afterIcon="editor-textcolor"
						required
					/>
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Color Settings', 'newspack-blocks' ) }
					initialOpen={ true }
					colorSettings={ [
						{
							value: textColor.color,
							onChange: setTextColor,
							label: __( 'Text Color', 'newspack-blocks' ),
						},
					] }
				/>
				<PanelBody title={ __( 'Article Meta Settings', 'newspack-blocks' ) }>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Date', 'newspack-blocks' ) }
							checked={ showDate }
							onChange={ () => setAttributes( { showDate: ! showDate } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Category', 'newspack-blocks' ) }
							checked={ showCategory }
							onChange={ () => setAttributes( { showCategory: ! showCategory } ) }
						/>
					</PanelRow>
					<PanelRow>
						<ToggleControl
							label={ __( 'Show Author', 'newspack-blocks' ) }
							checked={ showAuthor }
							onChange={ () => setAttributes( { showAuthor: ! showAuthor } ) }
						/>
					</PanelRow>
					{ showAuthor && (
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Author Avatar', 'newspack-blocks' ) }
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
			textColor,
		} = this.props; // variables getting pulled out of props
		const {
			showExcerpt,
			showDate,
			showImage,
			imageShape,
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
			showCaption,
			showCategory,
		} = attributes;

		const classes = classNames( className, {
			'is-grid': postLayout === 'grid',
			'show-image': showImage,
			[ `c-${ columns }` ]: postLayout === 'grid',
			[ `ts-${ typeScale }` ]: typeScale !== '5',
			[ `image-align${ mediaPosition }` ]: showImage,
			[ `image-scale${ imageScale }` ]: imageScale !== '1' && showImage,
			[ `image-shape${ imageShape }` ]: imageShape !== 'landscape',
			'has-text-color': textColor.color !== '',
			'show-caption': showCaption,
			'show-category': showCategory,
		} );

		const blockControls = [
			{
				icon: 'list-view',
				title: __( 'List View', 'newspack-blocks' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid View', 'newspack-blocks' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		const blockControlsImages = [
			{
				icon: 'align-none',
				title: __( 'Show media on top', 'newspack-blocks' ),
				isActive: mediaPosition === 'top',
				onClick: () => setAttributes( { mediaPosition: 'top' } ),
			},
			{
				icon: 'align-pull-left',
				title: __( 'Show media on left', 'newspack-blocks' ),
				isActive: mediaPosition === 'left',
				onClick: () => setAttributes( { mediaPosition: 'left' } ),
			},
			{
				icon: 'align-pull-right',
				title: __( 'Show media on right', 'newspack-blocks' ),
				isActive: mediaPosition === 'right',
				onClick: () => setAttributes( { mediaPosition: 'right' } ),
			},
			{
				icon: coverIcon,
				title: __( 'Show media behind', 'newspack-blocks' ),
				isActive: mediaPosition === 'behind',
				onClick: () => setAttributes( { mediaPosition: 'behind' } ),
			},
		];

		const blockControlsImageShape = [
			{
				icon: landscapeIcon,
				title: __( 'Landscape Image Shape', 'newspack-blocks' ),
				isActive: imageShape === 'landscape',
				onClick: () => setAttributes( { imageShape: 'landscape' } ),
			},
			{
				icon: portraitIcon,
				title: __( 'portrait Image Shape', 'newspack-blocks' ),
				isActive: imageShape === 'portrait',
				onClick: () => setAttributes( { imageShape: 'portrait' } ),
			},
			{
				icon: squareIcon,
				title: __( 'Square Image Shape', 'newspack-blocks' ),
				isActive: imageShape === 'square',
				onClick: () => setAttributes( { imageShape: 'square' } ),
			},
			{
				icon: uncroppedIcon,
				title: __( 'Uncropped', 'newspack-blocks' ),
				isActive: imageShape === 'uncropped',
				onClick: () => setAttributes( { imageShape: 'uncropped' } ),
			},
		];

		return (
			<Fragment>
				<div
					className={ classes }
					style={ {
						color: textColor.color,
					} }
				>
					{ latestPosts && ( ! RichText.isEmpty( sectionHeader ) || isSelected ) && (
						<RichText
							onChange={ value => setAttributes( { sectionHeader: value } ) }
							placeholder={ __( 'Write header…', 'newspack-blocks' ) }
							value={ sectionHeader }
							tagName="h2"
							className="article-section-title"
						/>
					) }
					{ latestPosts && ! latestPosts.length && (
						<Placeholder>{ __( 'Sorry, no posts were found.', 'newspack-blocks' ) }</Placeholder>
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
					{ showImage && <Toolbar controls={ blockControlsImageShape } /> }
				</BlockControls>
				<InspectorControls>{ this.renderInspectorControls() }</InspectorControls>
			</Fragment>
		);
	}
}

export default compose( [
	withColors( { textColor: 'color' } ),
	withSelect( ( select, props ) => {
		const { postsToShow, authors, categories, tags, single, singleMode } = props.attributes;
		const { getAuthors, getEntityRecords } = select( 'core' );
		const latestPostsQuery = pickBy(
			singleMode
				? { include: single }
				: {
						per_page: postsToShow,
						categories,
						author: authors,
						tags,
				  },
			value => ! isUndefined( value )
		);
		const postsListQuery = {
			per_page: 50,
		};
		return {
			latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
			postList: getEntityRecords( 'postType', 'post', postsListQuery ),
		};
	} ),
] )( Edit );
