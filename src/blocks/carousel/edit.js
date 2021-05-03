/* eslint-disable jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */

/**
 * External dependencies
 */
import { isEqual } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { dateI18n, __experimentalGetSettings } from '@wordpress/date';
import { Component, createRef, Fragment } from '@wordpress/element';
import {
	CheckboxControl,
	PanelBody,
	PanelRow,
	Placeholder,
	RadioControl,
	RangeControl,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies
 */
import QueryControls from '../../components/query-controls';
import createSwiper from './create-swiper';
import {
	formatAvatars,
	formatByline,
	formatSponsorLogos,
	formatSponsorByline,
} from '../../shared/js/utils';
// Use same posts store as Homepage Posts block.
import { postsBlockSelector, postsBlockDispatch, shouldReflow } from '../homepage-articles/utils';

// Max number of slides that can be shown at once.
const MAX_NUMBER_OF_SLIDES = 6;

class Edit extends Component {
	constructor( props ) {
		super( props );

		this.btnPlayRef = createRef();
		this.btnPauseRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.carouselRef = createRef();
		this.paginationRef = createRef();
	}

	componentDidMount() {
		this.initializeSwiper( 0 );
		this.props.triggerReflow();
	}

	componentDidUpdate( prevProps ) {
		if ( shouldReflow( prevProps, this.props ) ) {
			this.props.triggerReflow();
		}

		const { attributes, latestPosts } = this.props;

		if (
			prevProps.latestPosts !== latestPosts ||
			( prevProps.latestPosts &&
				latestPosts &&
				prevProps.latestPosts.length !== latestPosts.length ) ||
			! isEqual( prevProps.attributes, attributes )
		) {
			let initialSlide = 0;

			if ( this.swiperInstance ) {
				if ( latestPosts && this.swiperInstance.realIndex < latestPosts.length ) {
					initialSlide = this.swiperInstance.realIndex;
				}
				this.swiperInstance.destroy( true, true );
			}

			this.initializeSwiper( initialSlide );
		}
	}

	componentWillUnmount() {
		this.props.triggerReflow();
	}

	initializeSwiper( initialSlide ) {
		const { latestPosts } = this.props;

		if ( latestPosts && latestPosts.length ) {
			const { autoplay, delay, slidesPerView } = this.props.attributes;

			this.swiperInstance = createSwiper(
				{
					block: this.carouselRef.current, // Editor uses the same wrapper for block and swiper container.
					container: this.carouselRef.current,
					next: this.btnNextRef.current,
					prev: this.btnPrevRef.current,
					play: this.btnPlayRef.current,
					pause: this.btnPauseRef.current,
					pagination: this.paginationRef.current,
				},
				{
					autoplay,
					delay: delay * 1000,
					initialSlide,
					slidesPerView,
				}
			);
		}
	}

	render() {
		const {
			attributes,
			availablePostTypes,
			className,
			setAttributes,
			latestPosts,
			isUIDisabled,
		} = this.props;
		const {
			authors,
			autoplay,
			categories,
			delay,
			imageFit,
			postsToShow,
			postType,
			showCategory,
			showDate,
			showAuthor,
			showAvatar,
			showTitle,
			slidesPerView,
			specificMode,
			specificPosts,
			tags,
		} = attributes;
		const classes = classnames(
			className,
			'wp-block-newspack-blocks-carousel', // Default to make styles work for third-party consumers.
			'swiper-container',
			{
				'wp-block-newspack-blocks-carousel__autoplay-playing': autoplay,
				'newspack-block--disabled': isUIDisabled,
			}
		);
		const dateFormat = __experimentalGetSettings().formats.date;
		const hasNoPosts = latestPosts && ! latestPosts.length;
		const hasOnePost = latestPosts && latestPosts.length === 1;
		const maxPosts = latestPosts ? Math.min( postsToShow, latestPosts.length ) : postsToShow;
		return (
			<Fragment>
				<div className={ classes } ref={ this.carouselRef }>
					{ hasNoPosts && (
						<Placeholder className="component-placeholder__align-center">
							<div style={ { margin: 'auto' } }>{ __( 'Sorry, no posts were found.' ) }</div>
						</Placeholder>
					) }
					{ ! latestPosts && (
						<Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />
					) }
					{ latestPosts && (
						<Fragment>
							{ autoplay && (
								<Fragment>
									<button
										className="amp-carousel-button-pause amp-carousel-button"
										ref={ this.btnPauseRef }
									/>
									<button
										className="amp-carousel-button-play amp-carousel-button"
										ref={ this.btnPlayRef }
									/>
								</Fragment>
							) }
							<div className="swiper-wrapper">
								{ latestPosts.map( post => (
									<article
										className={ `post-has-image swiper-slide ${ post.post_type }` }
										key={ post.id }
									>
										<figure className="post-thumbnail">
											<a href="#" rel="bookmark">
												{ post.newspack_featured_image_src ? (
													<img
														className={ `image-fit-${ imageFit }` }
														src={ post.newspack_featured_image_src.large }
														alt=""
													/>
												) : (
													<div className="wp-block-newspack-blocks-carousel__placeholder"></div>
												) }
											</a>
										</figure>
										{ ( post.newspack_post_sponsors ||
											showCategory ||
											showTitle ||
											showAuthor ||
											showDate ) && (
											<div className="entry-wrapper">
												{ post.newspack_post_sponsors && (
													<span className="cat-links sponsor-label">
														<span className="flag">{ post.newspack_post_sponsors[ 0 ].flag }</span>
													</span>
												) }
												{ showCategory &&
													post.newspack_category_info.length &&
													! post.newspack_post_sponsors && (
														<div className="cat-links">
															<a href="#">{ decodeEntities( post.newspack_category_info ) }</a>
														</div>
													) }
												{ showTitle && (
													<h3 className="entry-title">
														<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
													</h3>
												) }
												<div className="entry-meta">
													{ post.newspack_post_sponsors &&
														formatSponsorLogos( post.newspack_post_sponsors ) }
													{ post.newspack_post_sponsors &&
														formatSponsorByline( post.newspack_post_sponsors ) }
													{ showAuthor &&
														showAvatar &&
														! post.newspack_post_sponsors &&
														formatAvatars( post.newspack_author_info ) }
													{ showAuthor &&
														! post.newspack_post_sponsors &&
														formatByline( post.newspack_author_info ) }
													{ showDate && (
														<time className="entry-date published" key="pub-date">
															{ dateI18n( dateFormat, post.date_gmt ) }
														</time>
													) }
												</div>
											</div>
										) }
									</article>
								) ) }
							</div>
							{ ! hasNoPosts && ! hasOnePost && (
								<>
									<button
										className="amp-carousel-button amp-carousel-button-prev swiper-button-prev"
										ref={ this.btnPrevRef }
									/>
									<button
										className="amp-carousel-button amp-carousel-button-next swiper-button-next"
										ref={ this.btnNextRef }
									/>
									<div
										className="swiper-pagination-bullets amp-pagination"
										ref={ this.paginationRef }
									/>
								</>
							) }
						</Fragment>
					) }
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Display Settings' ) } initialOpen={ true }>
						{ postsToShow && (
							<QueryControls
								numberOfItems={ postsToShow }
								onNumberOfItemsChange={ value =>
									setAttributes( { postsToShow: value ? value : 1 } )
								}
								authors={ authors }
								onAuthorsChange={ value => setAttributes( { authors: value } ) }
								categories={ categories }
								onCategoriesChange={ value => setAttributes( { categories: value } ) }
								tags={ tags }
								onTagsChange={ value => setAttributes( { tags: value } ) }
								specificMode={ specificMode }
								onSpecificModeChange={ _specificMode =>
									setAttributes( { specificMode: _specificMode } )
								}
								specificPosts={ specificPosts }
								onSpecificPostsChange={ _specificPosts =>
									setAttributes( { specificPosts: _specificPosts } )
								}
								postType={ postType }
							/>
						) }
					</PanelBody>
					<PanelBody title={ __( 'Slideshow Settings' ) } initialOpen={ true }>
						<RadioControl
							label={ __( 'Image Fit Style', 'newspack-blocks' ) }
							selected={ imageFit }
							onChange={ value => setAttributes( { imageFit: value } ) }
							options={ [
								{ label: __( 'Cover', 'newspack-blocks' ), value: 'cover' },
								{ label: __( 'Contain', 'newspack-blocks' ), value: 'contain' },
							] }
						/>
						<ToggleControl
							label={ __( 'Autoplay' ) }
							help={ __( 'Autoplay between slides' ) }
							checked={ autoplay }
							onChange={ _autoplay => {
								setAttributes( { autoplay: _autoplay } );
							} }
						/>
						{ autoplay && (
							<RangeControl
								label={ __( 'Delay between transitions (in seconds)' ) }
								value={ delay }
								onChange={ _delay => {
									setAttributes( { delay: _delay } );
								} }
								min={ 1 }
								max={ 20 }
							/>
						) }
						{ latestPosts && 0 < latestPosts.length && (
							<RangeControl
								label={ __( 'Number of slides to show at once' ) }
								value={ slidesPerView }
								onChange={ _slidesPerView => {
									setAttributes( { slidesPerView: _slidesPerView } );
								} }
								min={ 1 }
								max={ Math.min( MAX_NUMBER_OF_SLIDES, maxPosts ) }
							/>
						) }
					</PanelBody>
					<PanelBody title={ __( 'Article Meta Settings', 'newspack-blocks' ) }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Title', 'newspack-blocks' ) }
								checked={ showTitle }
								onChange={ () => setAttributes( { showTitle: ! showTitle } ) }
							/>
						</PanelRow>
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
					<PanelBody title={ __( 'Post Types', 'newspack-blocks' ) }>
						{ availablePostTypes &&
							availablePostTypes.map( ( { name, slug } ) => (
								<PanelRow key={ slug }>
									<CheckboxControl
										label={ name }
										checked={ postType.indexOf( slug ) > -1 }
										onChange={ value => {
											const cleanPostType = [ ...new Set( postType ) ];
											if ( value && cleanPostType.indexOf( slug ) === -1 ) {
												cleanPostType.push( slug );
											} else if ( ! value && cleanPostType.indexOf( slug ) > -1 ) {
												cleanPostType.splice( cleanPostType.indexOf( slug ), 1 );
											}
											setAttributes( {
												postType: cleanPostType,
											} );
										} }
									/>
								</PanelRow>
							) ) }
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default compose( [ withSelect( postsBlockSelector ), withDispatch( postsBlockDispatch ) ] )(
	Edit
);
