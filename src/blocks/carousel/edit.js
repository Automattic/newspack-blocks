/**
 * Internal dependencies
 */
import QueryControls from '../homepage-articles/query-controls';
import createSwiper from './create-swiper';
import classnames from 'classnames';

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
import { Component, createRef, Fragment, RawHTML } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import {
	PanelBody,
	PanelRow,
	Placeholder,
	RangeControl,
	Spinner,
	ToggleControl,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { withState, compose } from '@wordpress/compose';

import { PanelColorSettings, withColors } from '@wordpress/block-editor';

const { decodeEntities } = wp.htmlEntities;

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			autoPlayState: true,
		};
		this.carouselRef = createRef();
		this.btnNextRef = createRef();
		this.btnPrevRef = createRef();
		this.paginationRef = createRef();
	}
	componentDidUpdate( prevProps ) {
		const { attributes, latestPosts } = this.props;
		const { autoPlayState } = this.state;
		const { autoplay, delay } = attributes;
		const realIndex =
			this.swiperInstance && latestPosts && this.swiperInstance.realIndex < latestPosts.length
				? this.swiperInstance.realIndex
				: 0;
		this.swiperInstance && this.swiperInstance.destroy( true, true );
		this.swiperInstance = createSwiper(
			this.carouselRef.current,
			{
				autoplay:
					autoplay && autoPlayState
						? {
								delay: delay * 1000,
								disableOnInteraction: false,
						  }
						: false,
				effect: 'slide',
				initialSlide: realIndex,
				loop: true,
				navigation: {
					nextEl: this.btnNextRef.current,
					prevEl: this.btnPrevRef.current,
				},
				pagination: {
					clickable: true,
					el: this.paginationRef.current,
					type: 'bullets',
				},
			},
			{}
		);
	}
	render() {
		const {
			attributes,
			className,
			setAttributes,
			isSelected,
			latestPosts,
			hasPosts,
			authorList,
			categoriesList,
			tagsList,
		} = this.props;
		const { autoPlayState } = this.state;
		const {
			author,
			autoplay,
			categories,
			delay,
			postsToShow,
			showCategory,
			showDate,
			showAuthor,
			showAvatar,
			tags,
		} = attributes;
		const classes = classnames(
			className,
			'swiper-container',
			autoplay && autoPlayState && 'wp-block-newspack-blocks-carousel__autoplay-playing'
		);
		return (
			<Fragment>
				<div className={ classes } ref={ this.carouselRef }>
					{ latestPosts && ! latestPosts.length && (
						<Placeholder>{ __( 'Sorry, no posts were found.' ) }</Placeholder>
					) }
					{ ! latestPosts && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ latestPosts && (
						<Fragment>
							<div class="swiper-wrapper">
								{ latestPosts.map( post => (
									<article className="post-has-image swiper-slide" key={ post.id }>
										<figure className="post-thumbnail">
											{ post.newspack_featured_image_src && (
												<a href="#" rel="bookmark">
													<img src={ post.newspack_featured_image_src.landscape } />
												</a>
											) }
										</figure>
										<div className="entry-wrapper">
											{ showCategory && post.newspack_category_info.length && (
												<div class="cat-links">
													<a href="#">{ post.newspack_category_info }</a>
												</div>
											) }
											<h3 className="entry-title">
												<a href="#">{ decodeEntities( post.title.rendered.trim() ) }</a>
											</h3>
											<div className="entry-meta">
												{ showAuthor && showAvatar && post.newspack_author_info.avatar && (
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
								) ) }
							</div>
							<a
								className="amp-carousel-button amp-carousel-button-prev swiper-button-prev"
								ref={ this.btnPrevRef }
								role="button"
							/>
							<a
								className="amp-carousel-button amp-carousel-button-next swiper-button-next"
								ref={ this.btnNextRef }
								role="button"
							/>
							{ autoplay && (
								<Fragment>
									<a
										className="amp-carousel-button-pause amp-carousel-button"
										role="button"
										onClick={ () => {
											this.swiperInstance.autoplay.stop();
											this.setState( { autoPlayState: false } );
										} }
									/>
									<a
										className="amp-carousel-button-play amp-carousel-button"
										role="button"
										onClick={ () => {
											this.swiperInstance.autoplay.start();
											this.setState( { autoPlayState: true } );
										} }
									/>
								</Fragment>
							) }
							<div
								className="swiper-pagination-bullets amp-pagination"
								ref={ this.paginationRef }
							/>
						</Fragment>
					) }
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Display Settings' ) } initialOpen={ true }>
						{ postsToShow && categoriesList && (
							<QueryControls
								enableSingle={ false }
								numberOfItems={ postsToShow }
								onNumberOfItemsChange={ value => setAttributes( { postsToShow: value } ) }
								authorList={ authorList }
								tagsList={ tagsList }
								categoriesList={ categoriesList }
								selectedCategoryId={ categories }
								selectedAuthorId={ author }
								selectedTagId={ tags }
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
					</PanelBody>
					<PanelBody title={ __( 'Slideshow Settings' ) } initialOpen={ true }>
						<ToggleControl
							label={ __( 'Autoplay' ) }
							help={ __( 'Autoplay between slides' ) }
							checked={ autoplay }
							onChange={ autoplay => {
								setAttributes( { autoplay } );
							} }
						/>
						{ autoplay && (
							<RangeControl
								label={ __( 'Delay between transitions (in seconds)' ) }
								value={ delay }
								onChange={ delay => {
									setAttributes( { delay } );
								} }
								min={ 1 }
								max={ 20 }
							/>
						) }
					</PanelBody>
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
				</InspectorControls>
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, props ) => {
		const { postsToShow, author, categories, tags } = props.attributes;
		const { getAuthors, getEntityRecords } = select( 'core' );
		const latestPostsQuery = pickBy(
			{
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
			per_page: 100,
		};
		return {
			latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
			categoriesList: getEntityRecords( 'taxonomy', 'category', categoriesListQuery ),
			tagsList: getEntityRecords( 'taxonomy', 'post_tag', tagsListQuery ),
			authorList: getAuthors(),
		};
	} ),
] )( Edit );
