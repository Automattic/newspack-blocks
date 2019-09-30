import { map } from 'lodash';

import { Component } from '@wordpress/element';
import { FormTokenField } from '@wordpress/components';
import { withState } from '@wordpress/compose';

class AutocompleteTokenField extends Component {

	constructor( props ) {
		super( props );
		this.state = {
			suggestions: {},
			validValuesByLabel: {},
			validValuesByValue: {},
		};
	}

	updateSuggestions( input ) {
		const { fetchSuggestions } = this.props;
		if ( ! fetchSuggestions ) {
			return;
		}

		fetchSuggestions( input )
			.then( suggestions => { 
				const quickFetchSuggestions = {}
				const validValuesByLabel = this.state.validValuesByLabel;
				const validValuesByValue = this.state.validValuesByValue;

				suggestions.forEach( suggestion => {
					quickFetchSuggestions[ suggestion.value ] = suggestion.label;
					validValuesByLabel[ suggestion.label ] = suggestion.value;
					validValuesByValue[ suggestion.value ] = suggestion.label;
				} );

				this.setState( { suggestions: quickFetchSuggestions, validValuesByLabel, validValuesByValue } );
			} ); 
	}

	handleOnChange( tokenStrings ) {
		const { onChange } = this.props;

		const values = [];
		tokenStrings.forEach( tokenString => {
			if ( this.state.validValuesByLabel.hasOwnProperty( tokenString ) ) {
				values.push( this.state.validValuesByLabel[ tokenString ] );
			}
		} );

		onChange( values );
	}

	getTokens() {
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
				suggestions={ Object.values( suggestions ) }
				onChange={ tokens => this.handleOnChange( tokens ) }
				onInputChange={ input => this.updateSuggestions( input ) }
				saveTransform={ this.saveTransform }
			/>
		);
	}
}

export default AutocompleteTokenField;