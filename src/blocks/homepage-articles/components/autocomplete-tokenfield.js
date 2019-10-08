/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { FormTokenField, Spinner } from '@wordpress/components';
import { withState } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './autocomplete-tokenfield.scss';

/**
 * An multi-selecting, api-driven autocomplete input suitable for use in block attributes.
 */
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

	/**
	 * When the component loads, fetch information about the tokens so we can populate
	 * the tokens with the correct labels.
	 */
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

	/**
	 * Clean up any unfinished autocomplete api call requests.
	 */
	componentWillUnmount() {
		delete this.suggestionsRequest;
	}

	/**
	 * Refresh the autocomplete dropdown.
	 */
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

	/**
	 * When a token is selected, we need to convert the string label into a recognized value suitable for saving as an attribute.
	 *
	 * @param array tokenStrings An array of token label strings.
	 */
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

	/**
	 * To populate the tokens, we need to convert the values into a human-readable label.
	 *
	 * @return array An array of token label strings.
	 */
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

	/**
	 * Render.
	 */
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