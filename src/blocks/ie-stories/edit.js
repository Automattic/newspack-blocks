// /* eslint-disable jsx-a11y/anchor-is-valid */

// /**
//  * Internal dependencies
//  */
// import QueryControls from '../../components/query-controls';
// import { STORE_NAMESPACE } from '../homepage-articles/store';
// import {
// 	getEditorBlocksIds,
// 	isBlogPrivate,
// 	shouldReflow,
// 	queryCriteriaFromAttributes,
// } from '../homepage-articles/utils';
// import {
// 	formatAvatars,
// 	formatByline,
// 	formatSponsorLogos,
// 	formatSponsorByline,
// } from '../../shared/js/utils';

// /**
//  * External dependencies
//  */
// import classNames from 'classnames';

// /**
//  * WordPress dependencies
//  */
// import { __ } from '@wordpress/i18n';
// import { dateI18n, __experimentalGetSettings } from '@wordpress/date';
// import { Component, Fragment, RawHTML, useEffect } from '@wordpress/element';
// import {
// 	BlockControls,
// 	InspectorControls,
// 	PanelColorSettings,
// 	RichText,
// 	withColors,
// } from '@wordpress/block-editor';
// import {
// 	Button,
// 	ButtonGroup,
// 	PanelBody,
// 	PanelRow,
// 	RangeControl,
// 	Toolbar,
// 	ToggleControl,
// 	Placeholder,
// 	Spinner,
// 	BaseControl,
// 	Path,
// 	SVG,
// 	TextControl,
// 	SelectControl,
// } from '@wordpress/components';
// import { withDispatch, withSelect } from '@wordpress/data';
// import { compose } from '@wordpress/compose';
// import { decodeEntities } from '@wordpress/html-entities';

// let IS_SUBTITLE_SUPPORTED_IN_THEME;
// if (
// 	typeof window === 'object' &&
// 	window.newspackIsPostSubtitleSupported &&
// 	window.newspackIsPostSubtitleSupported.post_subtitle
// ) {
// 	IS_SUBTITLE_SUPPORTED_IN_THEME = true;
// }

// /* From https://material.io/tools/icons */
// const landscapeIcon = (
// 	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
// 		<Path d="M0 0h24v24H0z" fill="none" />
// 		<Path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z" />
// 	</SVG>
// );

// const portraitIcon = (
// 	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
// 		<Path d="M0 0h24v24H0z" fill="none" />
// 		<Path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" />
// 	</SVG>
// );

// const squareIcon = (
// 	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
// 		<Path d="M0 0h24v24H0z" fill="none" />
// 		<Path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z" />
// 	</SVG>
// );

// const uncroppedIcon = (
// 	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
// 		<Path d="M0 0h24v24H0z" fill="none" />
// 		<Path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2zm2 10H3v4c0 1.1.9 2 2 2h4v-2H5v-4zm14 4h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zm0-16h-4v2h4v4h2V5c0-1.1-.9-2-2-2z" />
// 	</SVG>
// );

// const coverIcon = (
// 	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
// 		<Path d="M0 0h24v24H0z" fill="none" />
// 		<Path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z" />
// 	</SVG>
// );

// class Edit extends Component {
// 	renderPost = post => {
// 		const { attributes, isUIDisabled } = this.props;
// 		const {
// 			showImage,
// 			imageRadius,
// 			imageShape,
// 			mediaPosition,
// 			hideImageOnDesktop,
// 			showCaption,
// 			showExcerpt,
// 			excerptNumberWorlds,
// 			showSubtitle,
// 			showAuthor,
// 			showAvatar,
// 			showDate,
// 			truncateTitle,
// 			titleCharLimit,
// 			detailPageUrl,
// 			showFullDate,
// 			showSocialShare,
// 			showCategory,
// 			showPrimaryCat,
// 			showCategoryOnTop,
// 			showTopic,
// 			sectionHeader,
// 			showgalleryEmbed,
// 			alternativeTopics,
// 			alternativeImage,
// 		} = attributes;

// 		const postClasses = classNames(
// 			{
// 				'post-has-image': post.newspack_featured_image_src,
// 				'homepage-posts-block__post--disabled': isUIDisabled,
// 				'is-video-article': post.type.includes( 'video' ),
// 			},
// 			post.newspack_article_classes
// 		);

// 		const detailUrlText = post.type.includes( 'video' ) ? 'Watch Video' : 'View Photos';

// 		const postTitle = this.titleForPost( post );
// 		const dateFormat = showFullDate ? 'F j, Y \a\t g:i a' : __experimentalGetSettings().formats.date;

// 		const style = imageRadius ? { borderRadius: `${ imageRadius }px` } : {};

// 		return (
// 			<article className={ postClasses } key={ post.id }>
// 				{ showImage && ! hideImageOnDesktop && post.newspack_featured_image_src && (
// 					<figure className="post-thumbnail" key="thumbnail" style={ style }>
// 						<a href="#">
// 							{ imageShape === 'landscape' && (
// 								<img src={ post.newspack_featured_image_src.landscape } alt="" />
// 							) }
// 							{ imageShape === 'portrait' && (
// 								<img src={ post.newspack_featured_image_src.portrait } alt="" />
// 							) }
// 							{ imageShape === 'square' && (
// 								<img src={ post.newspack_featured_image_src.square } alt="" />
// 							) }
// 							{ imageShape === 'uncropped' && (
// 								<img src={ post.newspack_featured_image_src.uncropped } alt="" />
// 							) }
// 						</a>
// 						{ showCaption && '' !== post.newspack_featured_image_caption && (
// 							<figcaption>{ post.newspack_featured_image_caption }</figcaption>
// 						) }
// 					</figure>
// 				) }

// 				<div className="entry-wrapper">
// 					{ '' !== post.newspack_post_topic_info && showTopic && (
// 						<div className="entry-custom-topic">
// 							<span class="ie-topic-slug"><a href="#">{ post.newspack_post_topic_info }</a></span>
// 						</div>
// 					) }
// 					{ RichText.isEmpty( sectionHeader ) ? (
// 						<h2 className="entry-title" key="title">
// 							{ post.newspack_post_format === 'aside' ? postTitle : <a href="#">{ postTitle }</a> }
// 						</h2>
// 					) : (
// 						<h3 className="entry-title" key="title">
// 							{ post.newspack_post_format === 'aside' ? postTitle : <a href="#">{ postTitle }</a> }
// 						</h3>
// 					) }
// 					{ IS_SUBTITLE_SUPPORTED_IN_THEME && showSubtitle && (
// 						<RawHTML
// 							key="subtitle"
// 							className="newspack-post-subtitle newspack-post-subtitle--in-homepage-block"
// 						>
// 							{ post.meta.newspack_post_subtitle || '' }
// 						</RawHTML>
// 					) }
// 					{ showExcerpt && (
// 						<RawHTML key="excerpt" className="excerpt-contain">
// 							{ post.newspack_post_format === 'aside'
// 								? post.content.rendered
// 								: post.excerpt.rendered.split( ' ' ).splice( 0, excerptNumberWorlds ).join( ' ' ) }

// 						</RawHTML>
// 					) }
// 					<div className="entry-meta-wrapper">
// 						<div className="entry-meta">
// 							{ post.newspack_post_sponsors && formatSponsorLogos( post.newspack_post_sponsors ) }
// 							{ post.newspack_post_sponsors && formatSponsorByline( post.newspack_post_sponsors ) }
// 							{ showAuthor &&
// 								showAvatar &&
// 								! post.newspack_post_sponsors &&
// 								formatAvatars( post.newspack_author_info ) }
// 							{ showAuthor &&
// 								! post.newspack_post_sponsors &&
// 								formatByline( post.newspack_author_info ) }
// 							{ post.newspack_post_sponsors && (
// 								<span className="cat-links sponsor-label">
// 									<span className="flag">{ post.newspack_post_sponsors[ 0 ].flag }</span>
// 								</span>
// 							) }
// 							{ showCategory && post.newspack_category_info.length && ! post.newspack_post_sponsors && (
// 								<div className="cat-links">
// 									<a href="#">{ decodeEntities( post.newspack_category_info ) }</a>
// 								</div>
// 							) }
// 							{ showDate && (
// 								<time className="entry-date published" key="pub-date">
// 									{ dateI18n( dateFormat, post.date_gmt ) }
// 								</time>
// 							) }
// 						</div>
// 						{ showSocialShare && (
// 							<div className="ie-share-hover-el icon-with-text"><span>Share</span><span className="ie-share-icon-plain"></span></div>
// 						) }
// 					</div>
// 					{ detailPageUrl && (
// 						<div class="post-read-more-wrapper">{ detailUrlText }</div>
// 					) }
// 				</div>
// 			</article>
// 		);
// 	};

// 	titleForPost = post => {
// 		if ( ! post.title ) {
// 			return '';
// 		}
// 		if ( typeof post.title === 'string' ) {
// 			return decodeEntities( post.title.trim() );
// 		}
// 		if ( typeof post.title === 'object' && post.title.rendered ) {
// 			return decodeEntities( post.title.rendered.trim() );
// 		}
// 	};

// 	renderInspectorControls = () => {
// 		const { attributes, setAttributes, textColor, setTextColor } = this.props;

// 		const {
// 			authors,
// 			specificPosts,
// 			postsToShow,
// 			categories,
// 			columns,
// 			singleColumnsOnTablet,
// 			showImage,
// 			imageResizeClasses,
// 			showCaption,
// 			hideImageOnDesktop,
// 			hideImageOnMobile,
// 			imageScale,
// 			fullImageOnMobile,
// 			imageAlignBehindMobile,
// 			imageAlignRightMobile,
// 			imageRadius,
// 			mobileStack,
// 			moreButton,
// 			viewAll,
// 			eagerLoad,
// 			detailPageUrl,
// 			showHeader,
// 			repeatedPost,
// 			enableIdentifier,
// 			showLiveVideoWidget,
// 			liveVideoTitle,
// 			liveVideoTitleURL,
// 			liveVideoDesktopWidthHeight,
// 			liveVideoMobileWidthHeight,
// 			liveVideoEmbedURL,
// 			liveVideoAutoPlay,
// 			liveVideoFullScreen,
// 			addH1Tag,
// 			addH2Tag,
// 			showLiveIndicator,
// 			showMovieReview,
// 			showTitleTop,
// 			showPostContent,
// 			showExcerpt,
// 			excerptNumberWorlds,
// 			hideExcerptOnMobile,
// 			showSubtitle,
// 			typeScale,
// 			showDate,
// 			truncateTitle,
// 			titleCharLimit,
// 			showFullDate,
// 			showAuthor,
// 			showAvatar,
// 			showSocialShare,
// 			socialShareForMobileOnly,
// 			showCategory,
// 			showPrimaryCat,
// 			showCategoryOnTop,
// 			showTopic,
// 			postLayout,
// 			mediaPosition,
// 			specificMode,
// 			globalQuery,
// 			popularMode,
// 			popularModeTimeframe,
// 			tags,
// 			tagExclusions,
// 			postType,
// 			taxonomies,
// 			showgalleryEmbed,
// 			storyOffset,
// 			startDate,
// 			endDate,
// 			alternativeTopics,
// 			alternativeImage,
// 			enableMpt,
// 			mptPostType,
// 			specificMptMode,
// 			specificMptPosts,
// 			IeUtmSource,
// 			breakingTemplate3,
// 			breakingTemplate3SpecificPostsId,
// 			hideIeStories,
// 			hideDays,
// 			specificFallback,
// 			currentTimestamp,
// 			openNewTab,
// 			openNewTabDesktop,
// 			openNewTabMobile,
// 			addH3Title,
// 			addH2Title,
// 			enableGA,
// 			gaEventCategory,
// 			gaEventAction,
// 			gaEventLabel,
// 			enableCurrentPostLinkAsEventLabel,
// 			enablePagination,
// 			enableFELeisure,
// 			leisureStyle,
// 			enableJSVideoStyle,
// 		} = attributes;

// 		const imageSizeOptions = [
// 			{
// 				value: 1,
// 				label: /* translators: label for small size option */ __( 'Small', 'newspack-blocks' ),
// 				shortName: /* translators: abbreviation for small size */ __( 'S', 'newspack-blocks' ),
// 			},
// 			{
// 				value: 2,
// 				label: /* translators: label for medium size option */ __( 'Medium', 'newspack-blocks' ),
// 				shortName: /* translators: abbreviation for medium size */ __( 'M', 'newspack-blocks' ),
// 			},
// 			{
// 				value: 3,
// 				label: /* translators: label for large size option */ __( 'Large', 'newspack-blocks' ),
// 				shortName: /* translators: abbreviation for large size */ __( 'L', 'newspack-blocks' ),
// 			},
// 			{
// 				value: 4,
// 				label: /* translators: label for extra large size option */ __(
// 					'Extra Large',
// 					'newspack-blocks'
// 				),
// 				shortName: /* translators: abbreviation for extra large size */ __(
// 					'XL',
// 					'newspack-blocks'
// 				),
// 			},
// 		];

// 		function onEventChange( changes ) {
// 			setAttributes({
// 				eventCategory: changes
// 			});
// 		}

// 		return (
// 			<Fragment>
// 				<PanelBody title={ __( 'JS Video Page setting', 'newspack-blocks' ) } initialOpen={ false }>
// 					<ToggleControl
// 						label={ __( 'Enable JS Video Page Style', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add JS Video Page style.', 'newspack-blocks' ) }
// 						checked={ enableJSVideoStyle }
// 						onChange={ () => setAttributes( { enableJSVideoStyle: ! enableJSVideoStyle } ) }
// 					/>
// 				</PanelBody>
// 				<PanelBody title={ __( 'FE Leisure Settings', 'newspack-blocks' ) } initialOpen={ true }>
// 					<ToggleControl
// 						label={ __( 'Enable FE Leisure Style', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add FE Leisure style.', 'newspack-blocks' ) }
// 						checked={ enableFELeisure }
// 						onChange={ () => setAttributes( { enableFELeisure: ! enableFELeisure } ) }
// 					/>
// 					{ enableFELeisure && (
// 						<SelectControl
// 							label={ __( 'Select Leisure style', 'newspack-blocks' ) }
// 							value={ leisureStyle }
// 							options={ [
// 								{ label: 'Small', value: 'small' },
// 								{ label: 'Big', value: 'big' },
// 							] }
// 							onChange={ value => {
// 								setAttributes( { leisureStyle: value } );
// 							} }
// 						/>
// 					) }
// 				</PanelBody>
// 				<PanelBody title={ __( 'Live Video Settings', 'newspack-blocks' ) }>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Live Video Widget', 'newspack-blocks' ) }
// 							checked={ showLiveVideoWidget }
// 							onChange={ () => setAttributes( { showLiveVideoWidget: ! showLiveVideoWidget } ) }
// 						/>
// 					</PanelRow>
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<TextControl
// 								label={__( 'Enter Live Video Title', 'ie-network-blocks' )}
// 								value={liveVideoTitle}
// 								onChange={( value ) => setAttributes( { liveVideoTitle: value } )}
// 							/>
// 						</PanelRow>
// 					) }
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<TextControl
// 								label={__( 'Enter Hyperlink for Title', 'ie-network-blocks' )}
// 								value={liveVideoTitleURL}
// 								onChange={( value ) => setAttributes( { liveVideoTitleURL: value } )}
// 							/>
// 						</PanelRow>
// 					) }
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<TextControl
// 								label={__( 'Enter Desktop Video Width and Height', 'ie-network-blocks' )}
// 								help={ __( 'For Example: 400,1000(400 is Width and 1000 is Height )', 'ie-network-blocks' ) }
// 								value={liveVideoDesktopWidthHeight}
// 								onChange={( value ) => setAttributes( { liveVideoDesktopWidthHeight: value } )}
// 							/>
// 						</PanelRow>
// 					) }
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<TextControl
// 								label={__( 'Enter Mobile Video Width and Height', 'ie-network-blocks' )}
// 								help={ __( 'For Example: 300,200(300 is Width and 200 is Height )', 'ie-network-blocks' ) }
// 								value={liveVideoMobileWidthHeight}
// 								onChange={( value ) => setAttributes( { liveVideoMobileWidthHeight: value } )}
// 							/>
// 						</PanelRow>
// 					) }
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<TextControl
// 								label={__( 'Enter Youtube Embed Video URL', 'ie-network-blocks' )}
// 								help={ __( 'Add YouTube Embed URL Only', 'ie-network-blocks' ) }
// 								value={liveVideoEmbedURL}
// 								onChange={( value ) => setAttributes( { liveVideoEmbedURL: value } )}
// 							/>
// 						</PanelRow>
// 					) }
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Autoplay', 'newspack-blocks' ) }
// 								checked={ liveVideoAutoPlay }
// 								onChange={ () => setAttributes( { liveVideoAutoPlay: ! liveVideoAutoPlay } ) }
// 							/>
// 						</PanelRow>
// 					) }
// 					{ showLiveVideoWidget && (
// 						<PanelRow>
// 							<ToggleControl
// 								label={ __( 'FullScreen', 'newspack-blocks' ) }
// 								checked={ liveVideoFullScreen }
// 								onChange={ () => setAttributes( { liveVideoFullScreen: ! liveVideoFullScreen } ) }
// 							/>
// 						</PanelRow>
// 					) }
// 				</PanelBody>
// 				<PanelBody title={ __( 'Display Settings', 'newspack-blocks' ) } initialOpen={ true }>
// 					<ToggleControl
// 						label={ __( 'Enable Identifier', 'newspack-blocks' ) }
// 						help={ __( 'This Button would display icons based on the post type of the story.', 'newspack-blocks' ) }
// 						checked={ enableIdentifier }
// 						onChange={ () => setAttributes( { enableIdentifier: ! enableIdentifier } ) }
// 					/>
// 					<QueryControls
// 						enableQueryFilter={ true }
// 						numberOfItems={ postsToShow }
// 						onNumberOfItemsChange={ _postsToShow =>
// 							setAttributes( { postsToShow: _postsToShow || 1 } )
// 						}
// 						breakingTemplate3={ breakingTemplate3 }
// 						onBreakingTemplate3Change={ _breakingTemplate3 =>
// 							setAttributes( { breakingTemplate3: _breakingTemplate3 } )
// 						}
// 						hideIeStories={ hideIeStories }
// 						onhideIeStoriesChange={ hideIeStories =>
// 							setAttributes( { hideIeStories: hideIeStories } )
// 						}
// 						hideDays={ hideDays }
// 						onhideDaysChange={ hideDays =>
// 							setAttributes( { hideDays: hideDays } )}
// 						breakingTemplate3SpecificPostsId={ breakingTemplate3SpecificPostsId }
// 						onBreakingTemplate3SpecificPostsIdChange={ _breakingTemplate3SpecificPostsId =>
// 							setAttributes( { breakingTemplate3SpecificPostsId: _breakingTemplate3SpecificPostsId } )
// 						}
// 						specificMode={ specificMode }
// 						onSpecificModeChange={ _specificMode =>
// 							setAttributes( { specificMode: _specificMode } )
// 						}
// 						specificFallback={ specificFallback }
// 						onSpecificFallbackChange={ _specificFallback =>
// 							setAttributes( { specificFallback: _specificFallback } )
// 						}
// 						globalQuery={ globalQuery }
// 						onGlobalQueryChange={ _globalQuery =>
// 							setAttributes( { globalQuery: _globalQuery } )
// 						}
// 						popularMode={ popularMode }
// 						onPopularModeChange={ _popularMode =>
// 							setAttributes( { popularMode: _popularMode } )
// 						}
// 						popularModeTimeframe={ popularModeTimeframe }
// 						onPopularModeTimeframeChange={ _popularModeTimeframe =>
// 							setAttributes( { popularModeTimeframe: _popularModeTimeframe } )
// 						}
// 						enableMpt={ enableMpt }
// 						onEnableMptModeChange={ _enableMpt =>
// 							setAttributes( { enableMpt: _enableMpt } )
// 						}
// 						specificMptMode={ specificMptMode }
// 						onSpecificMptModeChange={ _specificMptModeChange =>
// 							setAttributes( { specificMptMode: _specificMptModeChange } )
// 						}
// 						specificPosts={ specificPosts }
// 						onSpecificPostsChange={ _specificPosts =>
// 							setAttributes( { specificPosts: _specificPosts, currentTimestamp: Date.now() } )
// 						}
// 						specificMptPosts={ specificMptPosts }
// 						onspecificMptPostsChange={ _specificMptPosts =>
// 							setAttributes( { specificMptPosts: _specificMptPosts } )
// 						}
// 						postType={ postType }
// 						onPostTypeChange={ _postType => setAttributes( { postType: _postType, taxonomies: {}, specificPosts: [] } ) } // Flush taxonomies filter on post type change.
// 						mptPostType={ mptPostType }
// 						onMptPostTypeChange={ _mptPostType => setAttributes( { mptPostType: _mptPostType, taxonomies: {}, specificPosts:[] } ) } // Flush taxonomies selection on changing the post types.
// 						taxonomies={ taxonomies }
// 						onTaxonomiesChange={ _taxonomies => setAttributes( { taxonomies: _taxonomies } ) }
// 						authors={ authors }
// 						onAuthorsChange={ _authors => setAttributes( { authors: _authors } ) }
// 						categories={ categories }
// 						onCategoriesChange={ _categories => setAttributes( { categories: _categories } ) }
// 						tags={ tags }
// 						onTagsChange={ _tags => {
// 							setAttributes( { tags: _tags } );
// 						} }
// 						tagExclusions={ tagExclusions }
// 						onTagExclusionsChange={ _tagExclusions =>
// 							setAttributes( { tagExclusions: _tagExclusions } )
// 						}
// 					/>

// 					{ postLayout === 'grid' && (
// 						<>
// 							<RangeControl
// 								label={ __( 'Columns', 'newspack-blocks' ) }
// 								value={ columns }
// 								onChange={ _columns => setAttributes( { columns: _columns } ) }
// 								min={ 2 }
// 								max={ 6 }
// 								required
// 							/>

// 							<ToggleControl
// 								label={ __( 'Make single column from tablet screen', 'newspack-blocks' ) }
// 								checked={ singleColumnsOnTablet }
// 								onChange={ () => setAttributes( { singleColumnsOnTablet: ! singleColumnsOnTablet } ) }
// 							/>
// 						</>
// 					) }

// 					{ ! specificMode && isBlogPrivate() ? (
// 						/*
// 						 * Hide the "Load more posts" button option on private sites.
// 						 *
// 						 * Client-side fetching from a private WP.com blog requires authentication,
// 						 * which is not provided in the current implementation.
// 						 * See https://github.com/Automattic/newspack-blocks/issues/306.
// 						 */
// 						<i>
// 							{ __(
// 								'This blog is private, therefore the "Load more posts" feature is not active.',
// 								'newspack-blocks'
// 							) }
// 						</i>
// 					) : (
// 						<ToggleControl
// 							label={ __( 'Show "Load more posts" Button', 'newspack-blocks' ) }
// 							checked={ moreButton }
// 							onChange={ () => setAttributes( { moreButton: ! moreButton, viewAll: false } ) }
// 						/>
// 					) }

// 					<ToggleControl
// 						label={ __( 'Add Pagination', 'newspack-blocks' ) }
// 						checked={ enablePagination }
// 						onChange={ () => setAttributes( { enablePagination: ! enablePagination } ) }
// 					/>

// 					{ ! specificMode &&  (
// 						<ToggleControl
// 							label={ __( 'Show View More Button', 'newspack-blocks' ) }
// 							help={ __( 'This button allows to add custom link to redirect.', 'newspack-blocks' ) }
// 							checked={ viewAll }
// 							onChange={ () => setAttributes( { viewAll: ! viewAll, moreButton: false } ) }
// 						/>
// 					) }

// 					{
// 						<ToggleControl
// 							label={ __( 'Use Eager Load', 'newspack-blocks' ) }
// 							help={ __( 'Eager load the featured image. Use it if the story is on front page onload view.', 'newspack-blocks' ) }
// 							checked={ eagerLoad }
// 							onChange={ () => setAttributes( { eagerLoad: ! eagerLoad } ) }
// 						/>
// 					}

// 					{ ! specificMode && ( 'videos' === postType || 'picture-gallery' === postType  ) &&  (
// 					<ToggleControl
// 						label={ __( 'Show Post Detail Page link', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add View Photos/ Watch Video button.', 'newspack-blocks' ) }
// 						checked={ detailPageUrl }
// 						onChange={ () => setAttributes( { detailPageUrl: ! detailPageUrl, moreButton: false } ) }
// 						/>
// 					) }

// 					{ ! specificMode &&  (
// 						<ToggleControl
// 							label={ __( 'Show Section Header', 'newspack-blocks' ) }
// 							help={ __( 'This button allows to show header title.', 'newspack-blocks' ) }
// 							checked={ showHeader }
// 							onChange={ () => setAttributes( { showHeader: ! showHeader } ) }
// 						/>
// 					) }
// 					{ ! specificMode &&  (
// 						<ToggleControl
// 							label={ __( 'Remove Repeated Post', 'newspack-blocks' ) }
// 							help={ __( 'This button allows to prevent duplicate post.', 'newspack-blocks' ) }
// 							checked={ repeatedPost }
// 							onChange={ () => setAttributes( { repeatedPost: ! repeatedPost } ) }
// 						/>
// 					) }

// 					{ specificMode && specificFallback && (
// 					<TextControl
// 						label="Current Timestamp"
// 						help={ __( 'Current datetime', 'newspack-blocks' ) }
// 						value={currentTimestamp}
// 					/>
// 					) }
// 					<TextControl
// 						label="Offset For Stories"
// 						help={ __( 'Stories will be fetched according to the offset.', 'newspack-blocks' ) }
// 						value={storyOffset}
// 						onChange={ value => setAttributes( { storyOffset: value } ) }
// 					/>
// 					<TextControl
// 						label="Start Date Of Stories"
// 						help={ __( 'Stories will be fetched after the start date (Format - yyyy-mm-dd).', 'newspack-blocks' ) }
// 						value={startDate}
// 						onChange={ value => setAttributes( { startDate: value } ) }
// 					/>
// 					<TextControl
// 						label="End Date Of Stories"
// 						help={ __( 'Stories will be fetched before the end date (Format - yyyy-mm-dd).', 'newspack-blocks' ) }
// 						value={endDate}
// 						onChange={ value => setAttributes( { endDate: value } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Add H1 tag to home page lead story', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add h1 tag on home page lead story.', 'newspack-blocks' ) }
// 						checked={ addH1Tag }
// 						onChange={ () => setAttributes( { addH1Tag: ! addH1Tag } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Add H2 tag to home page lead story', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add h2 tag on home page lead story.', 'newspack-blocks' ) }
// 						checked={ addH2Tag }
// 						onChange={ () => setAttributes( { addH2Tag: ! addH2Tag } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Story Title Add in H2 tag', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add Story Title in h2 tag on IE Stories Block.', 'newspack-blocks' ) }
// 						checked={ addH2Title }
// 						onChange={ () => setAttributes( { addH2Title: ! addH2Title } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Story Title Add in H3 tag', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to add Story Title in h3 tag on IE Stories Block.', 'newspack-blocks' ) }
// 						checked={ addH3Title }
// 						onChange={ () => setAttributes( { addH3Title: ! addH3Title } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Add Live Blog Indicator', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to display live blog Indicator with time.', 'newspack-blocks' ) }
// 						checked={ showLiveIndicator }
// 						onChange={ () => setAttributes( { showLiveIndicator: ! showLiveIndicator } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Display Movie review star', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to display movie review star.', 'newspack-blocks' ) }
// 						checked={ showMovieReview }
// 						onChange={ () => setAttributes( { showMovieReview: ! showMovieReview } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Display Title on Top', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to display title on top.', 'newspack-blocks' ) }
// 						checked={ showTitleTop }
// 						onChange={ () => setAttributes( { showTitleTop: ! showTitleTop } ) }
// 					/>
// 					<TextControl
// 						label="Event category name"
// 						help={ __( 'Add "no_event" to remove unwanted event or add event name.', 'newspack-blocks' ) }
// 						value={attributes.eventCategory}
// 						onChange={onEventChange}
// 					/>
// 					<TextControl
// 						label="Add UTM Source"
// 						help={ __( 'Stories URL Append UTM Source', 'newspack-blocks' ) }
// 						value={IeUtmSource}
// 						onChange={ value => setAttributes( { IeUtmSource: value } ) }
// 					/>
// 					<ToggleControl
// 						label={ __( 'Show Post Content', 'newspack-blocks' ) }
// 						help={ __( 'This button allows to show Post Content.', 'newspack-blocks' ) }
// 						checked={ showPostContent }
// 						onChange={ () => setAttributes( { showPostContent: ! showPostContent } ) }
// 					/>
// 				</PanelBody>
// 				<PanelBody title={ __( 'Featured Image Settings', 'newspack-blocks' ) }>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Featured Image', 'newspack-blocks' ) }
// 							checked={ showImage }
// 							onChange={ () => setAttributes( { showImage: ! showImage } ) }
// 						/>
// 					</PanelRow>

// 					{ showImage && (
// 						<>
// 							<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Hide Featured Image from desktop', 'newspack-blocks' ) }
// 								checked={ hideImageOnDesktop }
// 								onChange={ () => setAttributes( { hideImageOnDesktop: ! hideImageOnDesktop } ) }
// 								/>
// 							</PanelRow>
// 							<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Hide Featured Image from Mobile', 'newspack-blocks' ) }
// 								checked={ hideImageOnMobile }
// 								onChange={ () => setAttributes( { hideImageOnMobile: ! hideImageOnMobile } ) }
// 							/>
// 							</PanelRow>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Show Featured Image Caption', 'newspack-blocks' ) }
// 									checked={ showCaption }
// 									onChange={ () => setAttributes( { showCaption: ! showCaption } ) }
// 								/>
// 							</PanelRow>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Show full image on mobile', 'newspack-blocks' ) }
// 									checked={ fullImageOnMobile }
// 									onChange={ () => setAttributes( { fullImageOnMobile: ! fullImageOnMobile } ) }
// 								/>
// 							</PanelRow>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Show image align behind class in mobile', 'newspack-blocks' ) }
// 									checked={ imageAlignBehindMobile }
// 									onChange={ () => setAttributes( { imageAlignBehindMobile: ! imageAlignBehindMobile } ) }
// 								/>
// 							</PanelRow>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Show image align right class in mobile', 'newspack-blocks' ) }
// 									checked={ imageAlignRightMobile }
// 									onChange={ () => setAttributes( { imageAlignRightMobile: ! imageAlignRightMobile } ) }
// 								/>
// 							</PanelRow>
// 							<RangeControl
// 								label={ __( 'Image Radius', 'newspack-blocks' ) }
// 								value={ imageRadius }
// 								onChange={ _imageRadius => setAttributes( { imageRadius: _imageRadius } ) }
// 								min={ 0 }
// 								max={ 50 }
// 							/>
// 						</>
// 					) }

// 					{ showImage && mediaPosition !== 'top' && mediaPosition !== 'behind' && (
// 						<Fragment>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Stack on mobile', 'newspack-blocks' ) }
// 									checked={ mobileStack }
// 									onChange={ () => setAttributes( { mobileStack: ! mobileStack } ) }
// 								/>
// 							</PanelRow>
// 							<BaseControl
// 								label={ __( 'Featured Image Size', 'newspack-blocks' ) }
// 								id="newspackfeatured-image-size"
// 							>
// 								<PanelRow>
// 									<ButtonGroup
// 										id="newspackfeatured-image-size"
// 										aria-label={ __( 'Featured Image Size', 'newspack-blocks' ) }
// 									>
// 										{ imageSizeOptions.map( option => {
// 											const isCurrent = imageScale === option.value;
// 											return (
// 												<Button
// 													isLarge
// 													isPrimary={ isCurrent }
// 													aria-pressed={ isCurrent }
// 													aria-label={ option.label }
// 													key={ option.value }
// 													onClick={ () => setAttributes( { imageScale: option.value } ) }
// 												>
// 													{ option.shortName }
// 												</Button>
// 											);
// 										} ) }
// 									</ButtonGroup>
// 								</PanelRow>
// 							</BaseControl>
// 						</Fragment>
// 					) }
// 					{ showImage &&
// 						<Fragment>
// 							<TextControl
// 								label={ __( 'Image Resize Classes', 'newspack-blocks' ) }
// 								help={ __( 'Note: Each classes is separated by space. These classes determine the inline width attribute for image, do not remove.', 'newspack-blocks' ) }
// 								value={ imageResizeClasses }
// 								onChange={ value => setAttributes( { imageResizeClasses: value } ) }
// 							/>
// 						</Fragment>
// 					}
// 				</PanelBody>
// 				<PanelBody title={ __( 'Post Control Settings', 'newspack-blocks' ) }>
// 					{ IS_SUBTITLE_SUPPORTED_IN_THEME && (
// 						<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Show Subtitle', 'newspack-blocks' ) }
// 								checked={ showSubtitle }
// 								onChange={ () => setAttributes( { showSubtitle: ! showSubtitle } ) }
// 							/>
// 						</PanelRow>
// 					) }
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Excerpt', 'newspack-blocks' ) }
// 							checked={ showExcerpt }
// 							onChange={ () => setAttributes( { showExcerpt: ! showExcerpt } ) }
// 						/>
// 					</PanelRow>
// 					{ showExcerpt && (
// 						<>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Hide excerpt for mobile device', 'newspack-blocks' ) }
// 									checked={ hideExcerptOnMobile }
// 									onChange={ () => setAttributes( { hideExcerptOnMobile: ! hideExcerptOnMobile } ) }
// 								/>
// 							</PanelRow>
// 							<RangeControl
// 								label={ __( 'Excerpt Length', 'newspack-blocks' ) }
// 								help={ __( 'Sets length of excerpt content', 'newspack-blocks' ) }
// 								value={ excerptNumberWorlds }
// 								onChange={ _excerptNumberWorlds => setAttributes( { excerptNumberWorlds: _excerptNumberWorlds } ) }
// 								min={ 10 }
// 								max={ 50 }
// 							/>
// 						</>

// 					) }
// 					<RangeControl
// 						className="type-scale-slider"
// 						label={ __( 'Type Scale', 'newspack-blocks' ) }
// 						value={ typeScale }
// 						onChange={ _typeScale => setAttributes( { typeScale: _typeScale } ) }
// 						min={ 1 }
// 						max={ 6 }
// 						beforeIcon="editor-textcolor"
// 						afterIcon="editor-textcolor"
// 						required
// 					/>
// 				</PanelBody>
// 				<PanelColorSettings
// 					title={ __( 'Color Settings', 'newspack-blocks' ) }
// 					initialOpen={ true }
// 					colorSettings={ [
// 						{
// 							value: textColor.color,
// 							onChange: setTextColor,
// 							label: __( 'Text Color', 'newspack-blocks' ),
// 						},
// 					] }
// 				/>
// 				<PanelBody title={ __( 'Post Meta Settings', 'newspack-blocks' ) }>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Truncate Title', 'newspack-blocks' ) }
// 							checked={ truncateTitle }
// 							onChange={ () => setAttributes( { truncateTitle: ! truncateTitle } ) }
// 						/>
// 					</PanelRow>
// 					{ truncateTitle && (
// 						<PanelRow>
// 							<RangeControl
// 								label={ __( 'Title Characters Limit', 'newspack-blocks' ) }
// 								help={ __( 'Sets length of title text', 'newspack-blocks' ) }
// 								value={ titleCharLimit }
// 								onChange={ _titleCharLimit => setAttributes( { titleCharLimit: _titleCharLimit } ) }
// 								min={ 10 }
// 								max={ 150 }
// 							/>
// 						</PanelRow>
// 					) }
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Date', 'newspack-blocks' ) }
// 							checked={ showDate }
// 							onChange={ () => setAttributes( { showDate: ! showDate } ) }
// 						/>
// 					</PanelRow>
// 					{ showDate && (
// 						<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Show Full Date and time', 'newspack-blocks' ) }
// 								help={ `Time is shows as: ${ ( showFullDate ) ? 'October 19, 2020 at 5:01 am' : '5min ago' }` }
// 								checked={ showFullDate }
// 								onChange={ () => setAttributes( { showFullDate: ! showFullDate } ) }
// 							/>
// 						</PanelRow>
// 					) }
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Category', 'newspack-blocks' ) }
// 							checked={ showCategory }
// 							onChange={ () => setAttributes( { showCategory: ! showCategory } ) }
// 						/>
// 					</PanelRow>
// 					{
// 						showCategory && (
// 							<>
// 								<BaseControl>
// 									<ToggleControl
// 										label={ __( 'Show Primary Category', 'newspack-blocks' ) }
// 										checked={ showPrimaryCat }
// 										onChange={ () => setAttributes( { showPrimaryCat: ! showPrimaryCat } ) }
// 									/>
// 								</BaseControl>
// 								<BaseControl>
// 									<ToggleControl
// 										label={ __( 'Show Category on Top', 'newspack-blocks' ) }
// 										checked={ showCategoryOnTop }
// 										onChange={ () => setAttributes( { showCategoryOnTop: ! showCategoryOnTop } ) }
// 									/>
// 								</BaseControl>
// 							</>
// 						)
// 					}
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Topic', 'newspack-blocks' ) }
// 							checked={ showTopic }
// 							onChange={ () => setAttributes( { showTopic: ! showTopic } ) }
// 						/>
// 					</PanelRow>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Author', 'newspack-blocks' ) }
// 							checked={ showAuthor }
// 							onChange={ () => setAttributes( { showAuthor: ! showAuthor } ) }
// 						/>
// 					</PanelRow>
// 					{ showAuthor && (
// 						<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Show Author Avatar', 'newspack-blocks' ) }
// 								checked={ showAvatar }
// 								onChange={ () => setAttributes( { showAvatar: ! showAvatar } ) }
// 							/>
// 						</PanelRow>
// 					) }
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Share Option', 'newspack-blocks' ) }
// 							checked={ showSocialShare }
// 							onChange={ () => setAttributes( { showSocialShare: ! showSocialShare } ) }
// 						/>
// 					</PanelRow>
// 					{ showSocialShare && (
// 						<PanelRow>
// 							<ToggleControl
// 								label={ __( 'Show Share Option For Mobile Only', 'newspack-blocks' ) }
// 								checked={ socialShareForMobileOnly }
// 								onChange={ () => setAttributes( { socialShareForMobileOnly: ! socialShareForMobileOnly } ) }
// 							/>
// 						</PanelRow>
// 					) }
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Latest Gallery For Section', 'newspack-blocks' ) }
// 							checked={ showgalleryEmbed }
// 							onChange={ () => setAttributes( { showgalleryEmbed: ! showgalleryEmbed } ) }
// 						/>
// 					</PanelRow>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Alternate Topic', 'newspack-blocks' ) }
// 							checked={ alternativeTopics }
// 							onChange={ () => setAttributes( { alternativeTopics: ! alternativeTopics } ) }
// 						/>
// 					</PanelRow>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Show Alternate Image', 'newspack-blocks' ) }
// 							checked={ alternativeImage }
// 							onChange={ () => setAttributes( { alternativeImage: ! alternativeImage } ) }
// 						/>
// 					</PanelRow>
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Open Link in New Tab', 'newspack-blocks' ) }
// 							checked={ openNewTab }
// 							onChange={ () => setAttributes( { openNewTab: ! openNewTab } ) }
// 						/>
// 					</PanelRow>
// 					{ openNewTab && (
// 						<>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Open Link in New Tab For Desktop Only', 'newspack-blocks' ) }
// 									checked={ openNewTabDesktop }
// 									onChange={ () => setAttributes( { openNewTabDesktop: ! openNewTabDesktop } ) }
// 								/>
// 							</PanelRow>
// 							<PanelRow>
// 								<ToggleControl
// 									label={ __( 'Open Link in New Tab For Mobile Only', 'newspack-blocks' ) }
// 									checked={ openNewTabMobile }
// 									onChange={ () => setAttributes( { openNewTabMobile: ! openNewTabMobile } ) }
// 								/>
// 							</PanelRow>
// 						</>
// 					) }
// 					<PanelRow>
// 						<ToggleControl
// 							label={ __( 'Enable GA tracking', 'ie-network-blocks' ) }
// 							checked={ enableGA }
// 							onChange={ () => setAttributes( { enableGA: ! enableGA } ) }
// 						/>
// 					</PanelRow>
// 						{
// 							enableGA && (
// 								<>
// 									<BaseControl>
// 										<TextControl
// 											label={ __( 'Event Category', 'ie-network-blocks' ) }
// 											value={ gaEventCategory }
// 											onChange={ ( value ) => setAttributes( { gaEventCategory: value } ) }
// 										/>
// 									</BaseControl>
// 									<BaseControl>
// 										<TextControl
// 											label={ __( 'Event Action', 'ie-network-blocks' ) }
// 											value={ gaEventAction }
// 											onChange={ ( value ) => setAttributes( { gaEventAction: value } ) }
// 										/>
// 									</BaseControl>
// 									<BaseControl>
// 										<TextControl
// 											label={ __( 'Event Label', 'ie-network-blocks' ) }
// 											value={ gaEventLabel }
// 											onChange={ ( value ) => setAttributes( { gaEventLabel: value } ) }
// 										/>
// 									</BaseControl>
// 									<BaseControl>
// 										<ToggleControl
// 											label={ __( 'Use Event Label as Current post link', 'ie-network-blocks' ) }
// 											checked={ enableCurrentPostLinkAsEventLabel }
// 											onChange={ () => setAttributes( { enableCurrentPostLinkAsEventLabel: ! enableCurrentPostLinkAsEventLabel } ) }
// 										/>
// 									</BaseControl>
// 								</>
// 							)
// 						}
// 				</PanelBody>
// 			</Fragment>
// 		);
// 	};

// 	componentDidMount() {
// 		this.props.triggerReflow();

// 		const { getCurrentPostType, attributes, setAttributes } = this.props;
// 		const { currentPostType } = attributes;

// 		if ( ! currentPostType ) {
// 			setAttributes( { currentPostType: getCurrentPostType } )
// 		}
// 	}
// 	componentDidUpdate( props ) {
// 		if ( shouldReflow( props, this.props ) ) {
// 			this.props.triggerReflow();
// 		}
// 	}
// 	componentWillUnmount() {
// 		this.props.triggerReflow();
// 	}

// 	render() {
// 		/**
// 		 * Constants
// 		 */

// 		const {
// 			attributes,
// 			className,
// 			setAttributes,
// 			isSelected,
// 			latestPosts,
// 			textColor,
// 			error,
// 		} = this.props;

// 		const {
// 			showImage,
// 			imageShape,
// 			postLayout,
// 			mediaPosition,
// 			moreButton,
// 			moreButtonText,
// 			viewAll,
// 			viewAllButtonText,
// 			columns,
// 			singleColumnsOnTablet,
// 			typeScale,
// 			imageScale,
// 			fullImageOnMobile,
// 			mobileStack,
// 			sectionHeader,
// 			hideImageOnDesktop,
// 			showCaption,
// 			showCategory,
// 			showPrimaryCat,
// 			showTopic,
// 			specificMode,
// 			showHeader,
// 			repeatedPost,
// 			addH1Tag,
// 			showgalleryEmbed,
// 			alternativeTopics,
// 			alternativeImage,
// 		} = attributes;

// 		const classes = classNames( className, {
// 			'is-grid': postLayout === 'grid',
// 			'show-image': showImage,
// 			[ `columns-${ columns }` ]: postLayout === 'grid',
// 			'single-column-from-tablet': singleColumnsOnTablet,
// 			[ `ts-${ typeScale }` ]: typeScale !== '5',
// 			[ `image-align${ mediaPosition }` ]: showImage,
// 			[ `is-${ imageScale }` ]: imageScale !== '1' && showImage,
// 			'mobile-stack': mobileStack,
// 			'alignfull-small-only': fullImageOnMobile,
// 			[ `is-${ imageShape }` ]: showImage,
// 			'has-text-color': textColor.color !== '',
// 			'hide-desktop': hideImageOnDesktop,
// 			'show-caption': showCaption,
// 			'show-category': showCategory,
// 			'show-topic': showTopic,
// 			'ie-stories': true,
// 		} );

// 		const blockControls = [
// 			{
// 				icon: 'list-view',
// 				title: __( 'List View', 'newspack-blocks' ),
// 				onClick: () => setAttributes( { postLayout: 'list' } ),
// 				isActive: postLayout === 'list',
// 			},
// 			{
// 				icon: 'grid-view',
// 				title: __( 'Grid View', 'newspack-blocks' ),
// 				onClick: () => setAttributes( { postLayout: 'grid' } ),
// 				isActive: postLayout === 'grid',
// 			},
// 		];

// 		const blockControlsImages = [
// 			{
// 				icon: 'align-none',
// 				title: __( 'Show media on top', 'newspack-blocks' ),
// 				isActive: mediaPosition === 'top',
// 				onClick: () => setAttributes( { mediaPosition: 'top' } ),
// 			},
// 			{
// 				icon: 'align-pull-left',
// 				title: __( 'Show media on left', 'newspack-blocks' ),
// 				isActive: mediaPosition === 'left',
// 				onClick: () => setAttributes( { mediaPosition: 'left' } ),
// 			},
// 			{
// 				icon: 'align-pull-right',
// 				title: __( 'Show media on right', 'newspack-blocks' ),
// 				isActive: mediaPosition === 'right',
// 				onClick: () => setAttributes( { mediaPosition: 'right' } ),
// 			},
// 			{
// 				icon: coverIcon,
// 				title: __( 'Show media behind', 'newspack-blocks' ),
// 				isActive: mediaPosition === 'behind',
// 				onClick: () => setAttributes( { mediaPosition: 'behind' } ),
// 			},
// 		];

// 		const blockControlsImageShape = [
// 			{
// 				icon: landscapeIcon,
// 				title: __( 'Landscape Image Shape', 'newspack-blocks' ),
// 				isActive: imageShape === 'landscape',
// 				onClick: () => setAttributes( { imageShape: 'landscape' } ),
// 			},
// 			{
// 				icon: portraitIcon,
// 				title: __( 'portrait Image Shape', 'newspack-blocks' ),
// 				isActive: imageShape === 'portrait',
// 				onClick: () => setAttributes( { imageShape: 'portrait' } ),
// 			},
// 			{
// 				icon: squareIcon,
// 				title: __( 'Square Image Shape', 'newspack-blocks' ),
// 				isActive: imageShape === 'square',
// 				onClick: () => setAttributes( { imageShape: 'square' } ),
// 			},
// 			{
// 				icon: uncroppedIcon,
// 				title: __( 'Uncropped', 'newspack-blocks' ),
// 				isActive: imageShape === 'uncropped',
// 				onClick: () => setAttributes( { imageShape: 'uncropped' } ),
// 			},
// 		];

// 		return (
// 			<Fragment>
// 				<div
// 					className={ classes }
// 					style={ {
// 						color: textColor.color,
// 					} }
// 				>
// 					<div>
// 						{ showHeader && latestPosts && ( ! RichText.isEmpty( sectionHeader ) || isSelected ) && (
// 							<RichText
// 								onChange={ value => setAttributes( { sectionHeader: value } ) }
// 								placeholder={ __( 'Write headerâ€¦', 'newspack-blocks' ) }
// 								value={ sectionHeader }
// 								tagName="h2"
// 								className="article-section-title"
// 							/>
// 						) }
// 						{ latestPosts && ! latestPosts.length && (
// 							<Placeholder>{ __( 'Sorry, no posts were found.', 'newspack-blocks' ) }</Placeholder>
// 						) }
// 						{ ! latestPosts && ! error && (
// 							<Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />
// 						) }
// 						{ ! latestPosts && error && (
// 							<Placeholder className="component-placeholder__align-center homepage-posts-block--error">
// 								{ error }
// 							</Placeholder>
// 						) }

// 						{ latestPosts && latestPosts.map( post => this.renderPost( post ) ) }
// 					</div>
// 				</div>

// 				{ ! specificMode && latestPosts && moreButton && ! isBlogPrivate() && (
// 					/*
// 					 * The "More" button option is hidden for private sites, so we should
// 					 * also hide the button in case it was previously enabled.
// 					 */
// 					<div className="editor-styles-wrapper ie-stories__wp-block-button__wrapper">
// 						<div className="wp-block-button">
// 							<RichText
// 								placeholder={ __( 'Load more posts', 'newspack-blocks' ) }
// 								value={ moreButtonText }
// 								onChange={ value => setAttributes( { moreButtonText: value } ) }
// 								className="wp-block-button__link"
// 								keepPlaceholderOnFocus
// 								allowedFormats={ [] }
// 							/>
// 						</div>
// 					</div>
// 				) }

// 				{ ! specificMode && latestPosts && viewAll && (

// 					<div className="editor-styles-wrapper ie-stories__wp-block-button__wrapper">
// 						<div className="wp-block-button">
// 							<RichText
// 								placeholder={ __( 'View All', 'newspack-blocks' ) }
// 								value={ viewAllButtonText }
// 								onChange={ value => setAttributes( { viewAllButtonText: value } ) }
// 								className="wp-block-button__link"
// 								keepPlaceholderOnFocus
// 								allowedFormats={ [ 'core/link' ] }
// 							/>
// 						</div>
// 					</div>
// 				) }

// 				<BlockControls>
// 					<Toolbar controls={ blockControls } />
// 					{ showImage && <Toolbar controls={ blockControlsImages } /> }
// 					{ showImage && <Toolbar controls={ blockControlsImageShape } /> }
// 				</BlockControls>
// 				<InspectorControls>{ this.renderInspectorControls() }</InspectorControls>
// 			</Fragment>
// 		);
// 	}
// }

// export default compose( [
// 	withColors( { textColor: 'color' } ),
// 	withSelect( ( select, { clientId, attributes } ) => {
// 		const { getEditorBlocks } = select( 'core/editor' );
// 		const { getBlocks } = select( 'core/block-editor' );
// 		const editorBlocksIds = getEditorBlocksIds( getEditorBlocks() );
// 		// The block might be rendered in the block styles preview, not in the editor.
// 		const isEditorBlock = editorBlocksIds.indexOf( clientId ) >= 0;

// 		const { getPosts, getError, isUIDisabled } = select( STORE_NAMESPACE );

// 		const props = {
// 			getCurrentPostType: wp.data.select( 'core/editor' ).getCurrentPostType(),
// 			isEditorBlock,
// 			isUIDisabled: isUIDisabled(),
// 			error: getError( { clientId } ),
// 			topBlocksClientIdsInOrder: getBlocks().map( block => block.clientId ),
// 		};

// 		if (isEditorBlock) {
// 			props.latestPosts = getPosts({ clientId });
// 		} else {
// 			// For block preview, display without deduplication. If there would be a way to match the outside-editor's
// 			// block clientId to the clientId of the block that's being previewed, the correct posts could be shown here.
// 			props.latestPosts = select( 'core' ).getEntityRecords(
// 				'postType',
// 				attributes.postType || 'post',
// 				queryCriteriaFromAttributes( attributes )
// 			);
// 		}

// 		return props;
// 	} ),
// 	withDispatch( ( dispatch, { isEditorBlock } ) => {
// 		return {
// 			// Only editor blocks can trigger reflows.
// 			triggerReflow: isEditorBlock ? dispatch( STORE_NAMESPACE ).reflow : () => {},
// 		};
// 	} ),
// ] )( Edit );
