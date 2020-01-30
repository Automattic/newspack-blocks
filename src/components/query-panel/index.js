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

const EntityTokenField = compose(
	withState( { input: undefined } ),
	withSelect( ( select, props ) => {
		const { entityKind, entityName, onChange, setState, value, input } = props;

		let currentValues = [];
		if ( value.length ) {
			currentValues = (
				select( 'core' ).getEntityRecords( entityKind, entityName, {
					per_page: value.length,
					include: value.join( ',' ),
				} ) || []
			).map( entity => ( {
				value: entity.name || '🤷‍♂️',
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
							: rawSuggestions.find( cat => cat.name == value )?.id
					)
					.filter( catId => typeof catId !== 'undefined' );
				onChange( entityIds );
			}
		};

		return {
			...props,
			value: currentValues,
			suggestions: rawSuggestions.map( c => c.name ),
			onChange: updateValue,
			onInputChange: input => setState( { input } ),
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
						<EntityTokenField
							entityKind="root"
							entityName="user"
							label={ __( 'Author', 'newspack-blocks' ) }
							onChange={ author => this.updateCriteria( { author } ) }
							value={ author }
						/>
						<EntityTokenField
							entityKind="taxonomy"
							entityName="category"
							label={ __( 'Category', 'newspack-blocks' ) }
							onChange={ categories => this.updateCriteria( { categories } ) }
							value={ categories }
						/>
						<EntityTokenField
							entityKind="taxonomy"
							entityName="post_tag"
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
		singleMode: false,
		singleId: 0,
		author: [],
		categories: [],
		tags: [],
		search: '',
	},
	onChange: () => null,
};
