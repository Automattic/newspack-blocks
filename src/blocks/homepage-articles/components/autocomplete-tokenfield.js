import { map } from 'lodash';

import { Component } from '@wordpress/element';
import { FormTokenField } from '@wordpress/components';
import { withState } from '@wordpress/compose';

class AutocompleteTokenField extends Component {

	constructor( props ) {
		super( props );
		this.state = {
			suggestions: [],
			validValuesByLabel: {},
			validValuesByValue: {},
		};
	}

	// on componentdidmount get the details for the saved tokens.

	updateSuggestions( input ) {
		const { fetchSuggestions } = this.props;
		if ( ! fetchSuggestions ) {
			return;
		}

		fetchSuggestions( input )
			.then( suggestions => { 
				const currentSuggestions = []
				const validValuesByLabel = this.state.validValuesByLabel;
				const validValuesByValue = this.state.validValuesByValue;

				suggestions.forEach( suggestion => {
					currentSuggestions.push( suggestion.label );
					validValuesByLabel[ suggestion.label ] = suggestion.value;
					validValuesByValue[ suggestion.value ] = suggestion.label;
				} );

				this.setState( { suggestions: currentSuggestions, validValuesByLabel, validValuesByValue } );
			} ); 
	}

	handleOnChange( tokenStrings ) {
		const { onChange } = this.props;

		// tokenStrings is an array of labels. We need to get the corresponding values for those labels.
		const values = [];
		tokenStrings.forEach( tokenString => {
			if ( this.state.validValuesByLabel.hasOwnProperty( tokenString ) ) {
				values.push( this.state.validValuesByLabel[ tokenString ] );
			}
		} );

		onChange( values );
	}

	getTokens() {
		// The token prop is an array of values. We need to get the corresponding labels for those values.
		const { tokens } = this.props;
		const tokenLabels = [];
		tokens.forEach( token => {
			if ( this.state.validValuesByValue.hasOwnProperty( token ) ) {
				tokenLabels.push( this.state.validValuesByValue[ token ] );
			}
		} );
		return tokenLabels;
	}

	render() {
		const { suggestions } = this.state;

		return (
			<FormTokenField
				value={ this.getTokens() }
				suggestions={ suggestions }
				onChange={ tokens => this.handleOnChange( tokens ) }
				onInputChange={ input => this.updateSuggestions( input ) }
				saveTransform={ this.saveTransform }
			/>
		);
	}
}

export default AutocompleteTokenField;