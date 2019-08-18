/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { RangeControl, SelectControl, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

class QueryPanel extends Component {

	updateCriteria = ( key, value ) => {
		const { criteria, onChange } = this.props;
		const { per_page, categories, tags, search, author } = { ...criteria, [ key ]: value };
		const sanitizedCriteria = { per_page: parseInt( per_page ) };
		if ( parseInt( categories ) > 0 ) {
			sanitizedCriteria.categories = parseInt( categories );
		}
		if ( parseInt( tags ) > 0 ) {
			sanitizedCriteria.tags = parseInt( tags );
		}
		if ( parseInt( author ) > 0 ) {
			sanitizedCriteria.author = parseInt( author );
		}
		if ( search && search.trim().length > 0 ) {
			sanitizedCriteria.search = search;
		}
		onChange( sanitizedCriteria );
	};

	render = () => {
		const { criteria, authorList, categoryList, tagList, onChange } = this.props;
		const { author, categories, per_page, tags, search } = criteria;
		const authorOptions = authorList.length
			? [
					{ label: __( 'Any author' ), value: '' },
					...authorList.map( author => ( { label: author.name, value: author.id } ) ),
			  ]
			: [ { label: __( 'Loading authors...' ), value: '' } ];
		const categoryOptions =
			categoryList && categoryList.length
				? [
						{ label: __( 'Select a Category' ), value: '' },
						...categoryList.map( category => ( { label: category.name, value: category.id } ) ),
				  ]
				: [ { label: __( 'Loading categories...' ), value: '' } ];
		const tagOptions =
			tagList && tagList.length
				? [
						{ label: __( 'Select a Tag' ), value: '' },
						...tagList.map( tag => ( { label: tag.name, value: tag.id } ) ),
				  ]
				: [ { label: __( 'Loading tags...' ), value: '' } ];
		return [
			<RangeControl
				key="query-panel-count-control"
				label={ __( 'Number of items' ) }
				value={ per_page }
				onChange={ value => this.updateCriteria( 'per_page', value ) }
				min={ 1 }
				max={ 100 }
				required
			/>,
			<SelectControl
				key="query-panel-category-control"
				label={ __( 'Category' ) }
				value={ categories || '' }
				options={ categoryOptions }
				onChange={ value => this.updateCriteria( 'categories', value ) }
			/>,
			<SelectControl
				key="query-panel-tag-control"
				label={ __( 'Tag' ) }
				value={ tags || '' }
				options={ tagOptions }
				onChange={ value => this.updateCriteria( 'tags', value ) }
			/>,
			<SelectControl
				key="query-panel-author-control"
				label={ __( 'Author' ) }
				value={ author || '' }
				options={ authorOptions }
				onChange={ value => this.updateCriteria( 'author', value ) }
			/>,
			<TextControl
				key="query-panel-search-control"
				label={ __( 'Search' ) }
				value={ search || '' }
				onChange={ value => this.updateCriteria( 'search', value ) }
			/>,
		];
	};
}

QueryPanel.defaultProps = {
	authorList: [],
	categoryOptions: [],
	criteria: {
		per_page: 3,
		author: '',
		categories: '',
		tags: '',
		search: '',
	},
	tagOptions: [],
	onChange: () => null,
};

export default withSelect( ( select, props ) => {
	const { getAuthors, getEntityRecords } = select( 'core' );
	return {
		authorList: getAuthors(),
		categoryList: getEntityRecords( 'taxonomy', 'category', {
			per_page: 100,
		} ),
		tagList: getEntityRecords( 'taxonomy', 'post_tag', {
			per_page: 100,
		} ),
	};
} )( QueryPanel );
