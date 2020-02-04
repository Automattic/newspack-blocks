/**
 * Internal dependencies
 */
// import QueryControls from '../query-controls';

/**
 * WordPress dependencies
 */
import { BaseControl, FormTokenField, QueryControls, ToggleControl } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Component, Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const EntityTokenField = compose(
	withState( { input: undefined } ),
	withSelect( ( select, props ) => {
		const { entityKind, entityName, entityToString, onChange, setState, value, input } = props;

		let currentValues = [];
		if ( value.length ) {
			currentValues = (
				select( 'core' ).getEntityRecords( entityKind, entityName, {
					per_page: value.length,
					include: value.join( ',' ),
				} ) || []
			).map( entity => ( {
				value: entityToString( entity ),
				id: entity.id,
			} ) );
		}

		const rawSuggestions =
			select( 'core' ).getEntityRecords( entityKind, entityName, {
				per_page: 100,
				search: input,
				exclude: value.join( ',' ),
			} ) || [];

		const updateValue = entityValues => {
			if ( onChange ) {
				const entityIds = entityValues
					.map( value =>
						typeof value === 'object'
							? value.id
							: rawSuggestions.find( e => entityToString( e ) == value )?.id
					)
					.filter( catId => typeof catId !== 'undefined' );
				onChange( entityIds );
			}
		};

		return {
			...props,
			value: currentValues,
			suggestions: rawSuggestions.map( c => entityToString( c ) ),
			onChange: updateValue,
			onInputChange: input => setState( { input } ),
		};
	} )
)( FormTokenField );

export default class QueryPanel extends Component {
	updateCriteria = newCriteria => {
		const { criteria, onChange } = this.props;
		const { per_page, offset, categories, tags, search, author, specificMode, specificPosts } = {
			...QueryPanel.defaultProps,
			...criteria,
			...newCriteria,
		};

		const sanitizedCriteria = {
			per_page: parseInt( per_page ),
			offset: parseInt( offset ),
			specificMode: !! specificMode,
			specificPosts,
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

		return onChange( sanitizedCriteria );
	};

	render = () => {
		const { criteria, postList } = this.props;
		const { author, per_page, specificMode, specificPosts, categories, tags } = criteria;

		return (
			<Fragment>
				{ /* <QueryControls
					numberOfItems={ per_page }
					onNumberOfItemsChange={ per_page => this.updateCriteria( { per_page } ) }
					postList={ postList }
					specificMode={ specificMode }
					specificPosts={ specificPosts }
					onSingleChange={ specificPosts => this.updateCriteria( { specificPosts } ) }
					onSpecificModeChange={ specificMode => this.updateCriteria( { specificMode } ) }
				/> */ }
				<ToggleControl
					key="specificMode"
					checked={ specificMode }
					onChange={ specificMode => this.updateCriteria( { specificMode } ) }
					label={ __( 'Choose Specific Posts', 'newspack-blocks' ) }
				/>
				{ specificMode && (
					<EntityTokenField
						entityKind="postType"
						entityName="post"
						entityToString={ e => e.title.rendered }
						label="Entity Posts"
						onChange={ specificPosts => this.updateCriteria( { specificPosts } ) }
						value={ specificPosts }
					/>
				) }
				{ ! specificMode && (
					<BaseControl>
						<QueryControls
							key="queryControls"
							numberOfItems={ per_page }
							onNumberOfItemsChange={ per_page => this.updateCriteria( { per_page } ) }
						/>
						<EntityTokenField
							entityKind="root"
							entityName="user"
							entityToString={ e => e.name }
							label={ __( 'Author', 'newspack-blocks' ) }
							onChange={ author => this.updateCriteria( { author } ) }
							value={ author }
						/>
						<EntityTokenField
							entityKind="taxonomy"
							entityName="category"
							entityToString={ e => e.name }
							label={ __( 'Category', 'newspack-blocks' ) }
							onChange={ categories => this.updateCriteria( { categories } ) }
							value={ categories }
						/>
						<EntityTokenField
							entityKind="taxonomy"
							entityName="post_tag"
							entityToString={ e => e.name }
							label={ __( 'tags', 'newspack-blocks' ) }
							onChange={ tags => this.updateCriteria( { tags } ) }
							value={ tags }
						/>
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
		specificMode: false,
		specificPosts: [],
		author: [],
		categories: [],
		tags: [],
		search: '',
	},
	onChange: () => null,
};
