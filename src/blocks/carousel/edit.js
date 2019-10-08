/**
 * Internal dependencies
 */
import QueryControls from '../homepage-articles/query-controls';

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
import { InspectorControls } from '@wordpress/editor';
import {
	PanelBody,
	Toolbar,
	ToggleControl,
	Dashicon,
	Placeholder,
	Spinner,
	Path,
	SVG,
} from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { withState, compose } from '@wordpress/compose';

import { PanelColorSettings, withColors } from '@wordpress/block-editor';

const { decodeEntities } = wp.htmlEntities;

class Edit extends Component {
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
		} = this.props; // variables getting pulled out of props
		const { author, categories, postsToShow, tags } = attributes;
		return (
			<Fragment>
				<div className={ className }>
					{ latestPosts && ! latestPosts.length && (
						<Placeholder>{ __( 'Sorry, no posts were found.' ) }</Placeholder>
					) }
					{ ! latestPosts && (
						<Placeholder>
							<Spinner />
						</Placeholder>
					) }
					{ latestPosts && (
						<Placeholder>{ __( 'Editor rendering of Carousel to come.' ) }</Placeholder>
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
