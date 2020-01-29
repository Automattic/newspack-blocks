/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component, Fragment } from '@wordpress/element';
import { Placeholder, Spinner } from '@wordpress/components';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			isLoading: false,
			error: '',
			embed: '',
		};
	}

	componentDidMount() {
		this.getSettings();
	}

	getSettings() {
		const path = '/newspack-blocks/v1/video-playlist';

		this.setState( { isLoading: true }, () => {
			apiFetch( { path } )
				.then( response => {
					const { html } = response;
					this.setState( {
						embed: html,
						isLoading: false,
					} );
				} )
				.catch( error => {
					this.setState( {
						isLoading: false,
						error: error.message,
					} );
				} );
		} );
	}

	renderPlaceholder() {
		const { isLoading, error } = this.state;

		if ( isLoading ) {
			return <Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />;
		}

		if ( error.length ) {
			return (
				<Placeholder
					icon="warning"
					label={ __( 'Error', 'newspack-blocks' ) }
					instructions={ error }
				/>
			);
		}

		return null;
	}

	render() {
		const { embed } = this.state;

		return (
			<Fragment>
				{ this.renderPlaceholder() }
				<div className="wp-block-embed__wrapper" dangerouslySetInnerHTML={ { __html: embed } } />
			</Fragment>
		);
	}
}

export default Edit;
