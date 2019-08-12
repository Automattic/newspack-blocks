/**
 * Internal dependencies
 */
import QueryControls from './query-controls';

/**
 * External dependencies
 */
import classNames from 'classnames';
import { isUndefined, pickBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { InspectorControls } from '@wordpress/editor';
import { Placeholder, Spinner } from '@wordpress/components';
import { getBlockType, createBlock } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';

class Edit extends Component {
	render = () => {
		const {
			attributes,
			authorList,
			categoriesList,
			innerBlocks,
			setAttributes,
			posts,
		} = this.props;
		const { postsToShow, categories, author } = attributes;
		return (
			<Fragment>
				<InspectorControls>
					<QueryControls
						numberOfItems={ postsToShow }
						onNumberOfItemsChange={ value => setAttributes( { postsToShow: value } ) }
						authorList={ authorList || [] }
						categoriesList={ categoriesList || [] }
						selectedCategoryId={ categories }
						selectedAuthorId={ author }
						onCategoryChange={ value =>
							setAttributes( { categories: '' !== value ? value : undefined } )
						}
						onAuthorChange={ value =>
							setAttributes( { author: '' !== value ? value : undefined } )
						}
					/>
				</InspectorControls>
				<InnerBlocks
					template={ ( posts || [] ).map( post => [ 'newspack-blocks/post', { post } ] ) }
					templateInsertUpdatesSelection={ false }
					templateLock="all"
				/>
				{ posts && ! posts.length && (
					<Placeholder>{ __( 'Sorry, no posts were found.' ) }</Placeholder>
				) }
				{ ! posts && (
					<Placeholder>
						<Spinner />
					</Placeholder>
				) }
			</Fragment>
		);
	};
}

export default withSelect( ( select, props ) => {
	const { clientId } = props;
	const { postsToShow, author, categories } = props.attributes;
	const { getAuthors, getEntityRecords } = select( 'core' );
	const { getBlocks } = select( 'core/block-editor' );
	const postsQuery = pickBy(
		{
			per_page: postsToShow,
			categories,
			author,
		},
		value => ! isUndefined( value )
	);

	const categoriesListQuery = {
		per_page: 100,
	};
	return {
		posts: getEntityRecords( 'postType', 'post', postsQuery ),
		categoriesList: getEntityRecords( 'taxonomy', 'category', categoriesListQuery ),
		authorList: getAuthors(),
		innerBlocks: getBlocks( clientId ),
	};
} )( Edit );
