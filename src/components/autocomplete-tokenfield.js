/**
 * External dependencies
 */
import { debounce } from 'lodash';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { FormTokenField, Spinner } from '@wordpress/components';
import { Icon, dragHandle, close } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './autocomplete-tokenfield.scss';

const DragHandle = SortableHandle( () => (
	<span className="autocomplete-tokenfield__sortable__item__drag">
		<Icon icon={ dragHandle } size={ 16 } />
	</span>
) );

const SortableItem = SortableElement( ( { value, onRemove } ) => (
	<li className="autocomplete-tokenfield__sortable__item">
		<DragHandle />
		<span className="autocomplete-tokenfield__sortable__item__value">{ value }</span>
		<button
			type="button"
			ariaLabel={ __( 'Remove', 'newspack-blocks' ) }
			onClick={ onRemove( value ) }
		>
			<Icon icon={ close } size={ 16 } />
		</button>
	</li>
) );

const SortableList = SortableContainer( ( { items, onRemove = () => {} } ) => {
	return (
		<ul>
			{ items.map( ( value, index ) => (
				<SortableItem
					key={ `item-${ value }` }
					index={ index }
					value={ value }
					onRemove={ onRemove }
				/>
			) ) }
		</ul>
	);
} );

/**
 * An multi-selecting, api-driven autocomplete input suitable for use in block attributes.
 */
class AutocompleteTokenField extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			suggestions: [],
			validValues: {},
			loading: this.isFetchingInfoOnLoad(),
		};

		this.debouncedUpdateSuggestions = debounce( this.updateSuggestions, 500 );
	}

	/**
	 * If the component has tokens passed in props, it should fetch info after it mounts.
	 */
	isFetchingInfoOnLoad = () => {
		const { tokens, fetchSavedInfo } = this.props;
		return Boolean( tokens.length && fetchSavedInfo );
	};

	/**
	 * When the component loads, fetch information about the tokens so we can populate
	 * the tokens with the correct labels.
	 */
	componentDidMount() {
		if ( this.isFetchingInfoOnLoad() ) {
			const { tokens, fetchSavedInfo } = this.props;

			fetchSavedInfo( tokens ).then( results => {
				const { validValues } = this.state;

				results.forEach( suggestion => {
					validValues[ suggestion.value ] = suggestion.label;
				} );

				this.setState( { validValues, loading: false } );
			} );
		}
	}

	/**
	 * Clean up any unfinished autocomplete api call requests.
	 */
	componentWillUnmount() {
		delete this.suggestionsRequest;
		this.debouncedUpdateSuggestions.cancel();
	}

	/**
	 * Get a list of labels for input values.
	 *
	 * @param {Array} values Array of values (ids, etc.).
	 * @return {Array} array of valid labels corresponding to the values.
	 */
	getLabelsForValues( values ) {
		const { validValues } = this.state;
		return values.reduce(
			( accumulator, value ) =>
				validValues[ value ] ? [ ...accumulator, validValues[ value ] ] : accumulator,
			[]
		);
	}

	/**
	 * Get a list of values for input labels.
	 *
	 * @param {Array} labels Array of labels from the tokens.
	 * @return {Array} Array of valid values corresponding to the labels.
	 */
	getValuesForLabels( labels ) {
		const { validValues } = this.state;
		return labels.map( label =>
			Object.keys( validValues ).find( key => validValues[ key ] === label )
		);
	}

	/**
	 * Refresh the autocomplete dropdown.
	 *
	 * @param {string} input Input to fetch suggestions for
	 */
	updateSuggestions( input ) {
		const { fetchSuggestions, tokens } = this.props;
		if ( ! fetchSuggestions ) {
			return;
		}

		this.setState( { loading: true }, () => {
			const request = fetchSuggestions( input );
			request
				.then( suggestions => {
					// A fetch Promise doesn't have an abort option. It's mimicked by
					// comparing the request reference in on the instance, which is
					// reset or deleted on subsequent requests or unmounting.
					if ( this.suggestionsRequest !== request ) {
						return;
					}

					const { validValues } = this.state;
					const currentSuggestions = [];

					suggestions.forEach( suggestion => {
						if ( tokens.includes( suggestion.value.toString() ) ) {
							return;
						}
						const trimmedSuggestionLabel = suggestion.label.trim();
						const duplicatedSuggestionIndex = currentSuggestions.indexOf( trimmedSuggestionLabel );
						if ( duplicatedSuggestionIndex >= 0 ) {
							suggestion.label = `${ trimmedSuggestionLabel } (${ suggestion.value })`;
						}
						currentSuggestions.push( trimmedSuggestionLabel );
						validValues[ suggestion.value ] = trimmedSuggestionLabel;
					} );

					this.setState( { suggestions: currentSuggestions, validValues, loading: false } );
				} )
				.catch( () => {
					if ( this.suggestionsRequest === request ) {
						this.setState( {
							loading: false,
						} );
					}
				} );

			this.suggestionsRequest = request;
		} );
	}

	/**
	 * When a token is selected, we need to convert the string label into a recognized value suitable for saving as an attribute.
	 *
	 * @param {Array} tokenStrings An array of token label strings.
	 */
	handleOnChange( tokenStrings ) {
		const { onChange, tokens, sortable } = this.props;
		onChange(
			sortable // If sortable, the input doesn't carry the value.
				? [ ...tokens, ...this.getValuesForLabels( tokenStrings ) ]
				: this.getValuesForLabels( tokenStrings )
		);
	}

	/**
	 * To populate the tokens, we need to convert the values into a human-readable label.
	 *
	 * @return {Array} An array of token label strings.
	 */
	getTokens() {
		const { tokens } = this.props;
		return this.getLabelsForValues( tokens );
	}

	onSortEnd = ( { oldIndex, newIndex } ) => {
		const { tokens, onChange } = this.props;
		const newTokens = [ ...tokens ];
		newTokens.splice( newIndex, 0, newTokens.splice( oldIndex, 1 )[ 0 ] );
		onChange( newTokens );
	};

	handleRemoveItem = label => () => {
		const value = this.getValuesForLabels( [ label ] )[ 0 ];
		const { tokens, onChange } = this.props;
		const newTokens = tokens.filter( token => token !== value );
		onChange( newTokens );
	};

	/**
	 * Render.
	 */
	render() {
		const { help, label = '', placeholder = '', sortable = false } = this.props;
		const { suggestions, loading } = this.state;
		const value = this.getTokens();
		return (
			<div className="autocomplete-tokenfield">
				{ sortable && value?.length ? (
					<div className="autocomplete-tokenfield__sortable">
						{ value?.length > 1 && (
							<p>{ __( 'Click and drag the items for sorting:', 'newspack-blocks' ) }</p>
						) }
						<SortableList
							items={ value }
							onSortEnd={ this.onSortEnd }
							onRemove={ this.handleRemoveItem }
							useDragHandle
						/>
					</div>
				) : null }
				<FormTokenField
					value={ sortable ? [] : value } // If sortable, we don't want to show the tokens in the input.
					suggestions={ suggestions }
					onChange={ tokens => this.handleOnChange( tokens ) }
					onInputChange={ input => this.debouncedUpdateSuggestions( input ) }
					label={ label }
					placeholder={ placeholder }
				/>
				{ loading && <Spinner /> }
				{ help && <p className="autocomplete-tokenfield__help">{ help }</p> }
			</div>
		);
	}
}

export default AutocompleteTokenField;
