import { map } from 'lodash';

import { Component } from '@wordpress/element';
import { FormTokenField } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

class AutocompleteTokenField extends Component {

	constructor( props ) {
		super( props );
		this.state = {
			suggestions: [],
			validValuesByLabel: {},
			validValuesByValue: {},
		};
	}

	componentDidMount() {
		const { tokens, fetchSavedInfo } = this.props;

		if ( ! tokens.length || ! fetchSavedInfo ) {
			return;
		}

		fetchSavedInfo( tokens )
			.then( results => {
				const { validValuesByLabel, validValuesByValue }  = this.state;

				results.forEach( suggestion => {
					validValuesByLabel[ suggestion.label ] = suggestion.value;
					validValuesByValue[ suggestion.value ] = suggestion.label;
				} );

				this.setState( { validValuesByLabel, validValuesByValue } );
			} );
	}

	updateSuggestions( input ) {
		const { fetchSuggestions } = this.props;
		if ( ! fetchSuggestions ) {
			return;
		}

		fetchSuggestions( input )
			.then( suggestions => { 
				const { validValuesByLabel, validValuesByValue }  = this.state;
				const currentSuggestions = []

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
		const { label = '' } = this.props;
		const { suggestions } = this.state;

		return (
			<FormTokenField
				value={ this.getTokens() }
				suggestions={ suggestions }
				onChange={ tokens => this.handleOnChange( tokens ) }
				onInputChange={ input => this.updateSuggestions( input ) }
				label={ label }
			/>
		);
	}
}

export default AutocompleteTokenField;