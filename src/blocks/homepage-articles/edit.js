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
import { InspectorControls, RichText } from '@wordpress/editor';
import { ToggleControl, PanelBody, PanelRow } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class Edit extends Component {
	render() {
		/**
		 * Constants
		 */
		const { attributes, className, setAttributes, latestPosts } = this.props; // variables getting pulled out of props
		const {
			align,
			content,
			showExcerpt,
			showDate,
			showImage,
			showAuthor,
			showCategory,
			postsToShow,
		} = attributes;
		const classes = classNames( className, `align${ align }` );

		return (
			<Fragment>
				<div className={ classes }>
					{ latestPosts && ( // makes sure the thing exists before trying to render, to prevent errors (sometimes block tries to render before query is done)
						<Fragment>
							{ latestPosts.map( post => (
								<article>
									{ showImage && post.featured_image_src && (
										<div className="post-thumbnail" key="thumbnail">
											<img src={ post.featured_image_src } />
										</div>
									) }
									{ showCategory && post.category_info && (
										<div className="cat-links" key="category-links">
											<RawHTML key="category">{ post.category_info }</RawHTML>
										</div>
									) }
									<h2 key="title">
										<a href={ post.link }>{ post.title.rendered }</a>
									</h2>
									{ showExcerpt && <RawHTML key="excerpt">{ post.excerpt.rendered }</RawHTML> }

									<div className="article-meta">
										{ showAuthor && (
											<span className="byline" key="byline">
												{ post.author_avatar && (
													<span className="avatar author-avatar" key="author-avatar">
														<RawHTML>{ post.author_avatar }</RawHTML>
													</span>
												) }
												{ __( 'by' ) }
												<span className="author vcard">
													<a className="url fn n" href={ post.author_info.author_link }>
														{ post.author_info.display_name }
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
								</article>
							) ) }
						</Fragment>
					) }
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Latest Articles Settings' ) } initialOpen={ true }>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Featured Image' ) }
								checked={ showImage }
								onChange={ () => setAttributes( { showImage: ! showImage } ) }
							/>
						</PanelRow>
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Excerpt' ) }
								checked={ showExcerpt }
								onChange={ () => setAttributes( { showExcerpt: ! showExcerpt } ) }
							/>
						</PanelRow>
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
						<PanelRow>
							<ToggleControl
								label={ __( 'Show Category' ) }
								checked={ showCategory }
								onChange={ () => setAttributes( { showCategory: ! showCategory } ) }
							/>
						</PanelRow>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default withSelect( ( select, props ) => {
	const { getEntityRecords } = select( 'core' );
	const latestPostsQuery = pickBy(
		{
			per_page: 3,
		},
		value => ! isUndefined( value )
	);
	return {
		latestPosts: getEntityRecords( 'postType', 'post', latestPostsQuery ),
	};
} )( Edit );
