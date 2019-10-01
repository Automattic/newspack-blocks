import { map } from 'lodash';

import { Component } from '@wordpress/element';
import { FormTokenField, Spinner } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

import './autocomplete-tokenfield.scss';

class AutocompleteTokenField extends Component {

	constructor( props ) {
		super( props );
		this.state = {
			suggestions: [],
			validValuesByLabel: {},
			validValuesByValue: {},
			loading: false,
		};
	}

	componentDidMount() {
		const { tokens, fetchSavedInfo } = this.props;

		if ( ! tokens.length || ! fetchSavedInfo ) {
			return;
		}

		this.setState( { loading: true }, () => {
			fetchSavedInfo( tokens )
				.then( results => {
					const { validValuesByLabel, validValuesByValue }  = this.state;

					results.forEach( suggestion => {
						validValuesByLabel[ suggestion.label ] = suggestion.value;
						validValuesByValue[ suggestion.value ] = suggestion.label;
					} );

					this.setState( { validValuesByLabel, validValuesByValue, loading: false } );
				} );
		} );
	}

	componentWillUnmount() {
		delete this.suggestionsRequest;
	}

	updateSuggestions( input ) {
		const { fetchSuggestions } = this.props;
		if ( ! fetchSuggestions ) {
			return;
		}

		this.setState( { loading: true }, () => {
			const request = fetchSuggestions( input );
			request.then( suggestions => { 
				// A fetch Promise doesn't have an abort option. It's mimicked by
				// comparing the request reference in on the instance, which is
				// reset or deleted on subsequent requests or unmounting.
				if ( this.suggestionsRequest !== request ) {
					return;
				}

				const { validValuesByLabel, validValuesByValue }  = this.state;
				const currentSuggestions = []

				suggestions.forEach( suggestion => {
					currentSuggestions.push( suggestion.label );
					validValuesByLabel[ suggestion.label ] = suggestion.value;
					validValuesByValue[ suggestion.value ] = suggestion.label;
				} );

				this.setState( { suggestions: currentSuggestions, validValuesByLabel, validValuesByValue, loading: false } );
			} ).catch( () => {
				if ( this.suggestionsRequest === request ) {
					this.setState( {
						loading: false,
					} );
				}
			} );

			this.suggestionsRequest = request;
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
		const { suggestions, loading } = this.state;

		return (
			<div className='autocomplete-tokenfield'>
				<FormTokenField
					value={ this.getTokens() }
					suggestions={ suggestions }
					onChange={ tokens => this.handleOnChange( tokens ) }
					onInputChange={ input => this.updateSuggestions( input ) }
					label={ label }
				/>
				{ loading && <Spinner /> }
			</div>
		);
	}
}

export default AutocompleteTokenField;