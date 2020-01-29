/**
 * Internal dependencies
 */
import QueryControls from '../query-controls';

/**
 * WordPress dependencies
 */
import { BaseControl, FormTokenField } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const AuthorField = compose(
	withState( { authorValues: undefined } ),
	withSelect( ( select, props ) => {
		const { onChange, authorValues, setState, value } = props;
		const allUsers = select( 'core' ).getAuthors();

		const userIdFor = name => allUsers.find( u => u.name === name )?.id;
		const userNameFor = id => allUsers.find( u => u.id === id )?.name;

		// initialize state from value once select returns
		if ( ! authorValues && value && allUsers ) {
			setState( {
				authorValues: value.map( id => userNameFor( id ) || __( '(no name)', 'newspack-blocks' ) ),
			} );
		}

		const updateAuthors = authorValues => {
			setState( { authorValues } );
			( onChange || noop )( authorValues.map( userIdFor ) );
		};

		return {
			value: authorValues,
			suggestions: ( allUsers || [] ).map( user => user.name ),
			onChange: updateAuthors,
		};
	} )
)( props => {
	return <FormTokenField label={ __( 'Author', 'newspack-blocks' ) } { ...props } />;
} );

const CategoryField = compose(
	withState( { input: undefined } ),
	withSelect( ( select, props ) => {
		const { onChange, setState, value, input } = props;

		let currentValues = [];
		if ( value.length ) {
			currentValues = (
				select( 'core' ).getEntityRecords( 'taxonomy', 'category', {
					per_page: value.length,
					include: value.join( ',' ),
				} ) || []
			).map( c => ( {
				value: c.name || __( '(no title)', 'newspack-blocks' ),
				id: c.id,
			} ) );
		}

		const rawSuggestions =
			select( 'core' ).getEntityRecords( 'taxonomy', 'category', {
				per_page: 100,
				search: input,
				exclude: value.join( ',' ),
			} ) || [];

		const updateCategories = categoryValues => {
			if ( onChange ) {
				onChange(
					categoryValues
						.map( value =>
							typeof value === 'object'
								? value.id
								: rawSuggestions.find( cat => cat.name == value )?.id
						)
						.filter( catId => typeof catId !== 'undefined' )
				);
			}
		};

		return {
			label: __( 'Category', 'newspack-blocks' ),
			value: currentValues,
			suggestions: rawSuggestions.map( c => c.name || __( '(no title)', 'newspack-blocks' ) ),
			onChange: updateCategories,
			onInputChange: input => setState( { input } ),
		};
	} )
)( FormTokenField );

const TagField = compose(
	withState( { tagValues: undefined } ),
	withSelect( ( select, props ) => {
		const { onChange, tagValues, setState, value } = props;
		const allTags = select( 'core' ).getEntityRecords( 'taxonomy', 'post_tag' );

		const tagIdFor = name => allTags.find( c => c.name === name )?.id;
		const tagNameFor = id => allTags.find( c => c.id === id )?.name;

		// initialize state from value once select returns
		if ( ! tagValues && value && allTags?.length > 0 ) {
			setState( {
				tagValues: value.map( id => tagNameFor( id ) || __( '(no title)', 'newspack-blocks' ) ),
			} );
		}

		const updateTags = tagValues => {
			setState( { tagValues } );
			if ( onChange ) {
				onChange( tagValues.map( tagIdFor ) );
			}
		};

		return {
			label: __( 'Tags', 'newspack-blocks' ),
			value: tagValues,
			suggestions: ( allTags || [] ).map( tag => tag.name ),
			onChange: updateTags,
		};
	} )
)( FormTokenField );

export default class QueryPanel extends Component {
	updateCriteria = newCriteria => {
		const { criteria, onChange } = this.props;
		const { per_page, offset, categories, tags, search, author, singleMode, singleId } = {
			...criteria,
			...newCriteria,
		};

		const sanitizedCriteria = {
			per_page: parseInt( per_page ),
			offset: parseInt( offset ),
			singleMode: !! singleMode,
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

		if ( singleMode && parseInt( singleId ) ) {
			sanitizedCriteria.singleId = parseInt( singleId );
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
					<BaseControl>
						<AuthorField
							onChange={ author => this.updateCriteria( { author } ) }
							value={ author }
						/>
						<CategoryField
							onChange={ categories => this.updateCriteria( { categories } ) }
							value={ categories }
						/>
						<TagField onChange={ tags => this.updateCriteria( { tags } ) } value={ tags } />
					</BaseControl>
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
