/**
 * Internal dependencies
 */
import QueryControls from '../../blocks/homepage-articles/query-controls';
import AutocompleteTokenField from '../../blocks/homepage-articles/components/autocomplete-tokenfield';

/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { BaseControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

const fetchAuthorSuggestions = async search => {
	const users = await apiFetch( {
		path: addQueryArgs( '/wp/v2/users', {
			search,
			per_page: 20,
			_fields: 'id,name',
		} ),
	} );

	return users.map( user => ( {
		value: user.id,
		label: decodeEntities( user.name ) || __( '(no name)', 'newspack-blocks' ),
	} ) );
};

const fetchSavedAuthors = async userIDs => {
	const users = await apiFetch( {
		path: addQueryArgs( '/wp/v2/users', {
			per_page: 100,
			include: userIDs.join( ',' ),
		} ),
	} );

	return users.map( user => ( {
		value: user.id,
		label: decodeEntities( user.name ) || __( '(no name)', 'newspack-blocks' ),
	} ) );
};

const fetchCategorySuggestions = async search => {
	const categories = await apiFetch( {
		path: addQueryArgs( '/wp/v2/categories', {
			search,
			per_page: 20,
			_fields: 'id,name',
			orderby: 'count',
			order: 'desc',
		} ),
	} );

	return categories.map( category => ( {
		value: category.id,
		label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
	} ) );
};

const fetchSavedCategories = async categoryIDs => {
	const categories = await apiFetch( {
		path: addQueryArgs( '/wp/v2/categories', {
			per_page: 100,
			_fields: 'id,name',
			include: categoryIDs.join( ',' ),
		} ),
	} );

	return categories.map( category => ( {
		value: category.id,
		label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
	} ) );
};

const fetchTagSuggestions = async search => {
	const tags = await apiFetch( {
		path: addQueryArgs( '/wp/v2/tags', {
			search,
			per_page: 20,
			_fields: 'id,name',
			orderby: 'count',
			order: 'desc',
		} ),
	} );

	return tags.map( tag => ( {
		value: tag.id,
		label: decodeEntities( tag.name ) || __( '(no title)', 'newspack-blocks' ),
	} ) );
};

const fetchSavedTags = async tagIDs => {
	const tags = await apiFetch( {
		path: addQueryArgs( '/wp/v2/tags', {
			per_page: 100,
			_fields: 'id,name',
			include: tagIDs.join( ',' ),
		} ),
	} );

	return tags.map( tag => ( {
		value: tag.id,
		label: decodeEntities( tag.name ) || __( '(no title)', 'newspack-blocks' ),
	} ) );
};

export default class QueryPanel extends Component {
	updateCriteria = newCriteria => {
		const { criteria, onChange } = this.props;
		const { per_page, offset, categories, tags, search, author, singleMode, singleId } = { ...criteria, ...newCriteria };

		const sanitizedCriteria = {
			per_page: parseInt( per_page ),
			offset: parseInt( offset ),
		};

		if ( author ) {
			sanitizedCriteria.author = author.map( n => parseInt( n ) );
		}

		if ( categories ) {
			sanitizedCriteria.categories = categories.map( n => parseInt( n ) );
		}

		if ( tags ) {
			sanitizedCriteria.tags = tags.map( n => parseInt( n ) );
		}

		if ( search && search.trim().length > 0 ) {
			sanitizedCriteria.search = search;
		}

		if ( singleMode ) {
			sanitizedCriteria.singleMode = singleMode;
			sanitizedCriteria.singleId = parseInt( singleId );
		} else {
			sanitizedCriteria.singleMode = false;
		}

		return onChange( sanitizedCriteria );
	};

	render = () => {
		const { criteria, postList } = this.props;
		const { author, per_page, singleMode, singleId, categories, tags } = criteria;

		return (
			<Fragment>
				<QueryControls
					numberOfItems={ per_page }
					onNumberOfItemsChange={ per_page => this.updateCriteria( { per_page } ) }
					postList={ postList }
					singleMode={ singleMode }
					selectedSingleId={ singleId }
					onSingleChange={ singleId => this.updateCriteria( { singleId } ) }
					onSingleModeChange={ singleMode => this.updateCriteria( { singleMode } ) }
				/>
				{ ! singleMode && (
					<Fragment>
						<BaseControl>
							<AutocompleteTokenField
								tokens={ author || [] }
								onChange={ author => this.updateCriteria( { author } ) }
								fetchSuggestions={ fetchAuthorSuggestions }
								fetchSavedInfo={ fetchSavedAuthors }
								label={ __( 'Author', 'newspack-blocks' ) }
							/>
						</BaseControl>
						<BaseControl>
							<AutocompleteTokenField
								tokens={ categories || [] }
								onChange={ categories => this.updateCriteria( { categories } ) }
								fetchSuggestions={ fetchCategorySuggestions }
								fetchSavedInfo={ fetchSavedCategories }
								label={ __( 'Category', 'newspack-blocks' ) }
							/>
						</BaseControl>
						<BaseControl>
							<AutocompleteTokenField
								tokens={ tags || [] }
								onChange={ tags => this.updateCriteria( { tags } ) }
								fetchSuggestions={ fetchTagSuggestions }
								fetchSavedInfo={ fetchSavedTags }
								label={ __( 'Tag', 'newspack-blocks' ) }
							/>
						</BaseControl>
					</Fragment>
				) }
			</Fragment>
		);
	};
}

QueryPanel.defaultProps = {
	criteria: {
		per_page: 3,
		offset: 0,
		singleMode: false,
		singleId: 0,
		author: [],
		categories: [],
		tags: [],
		search: '',
	},
	onChange: () => null,
};
