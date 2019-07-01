/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { SelectControl } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';

class Edit extends Component {

	/**
	 * Constructor.
	 */
	constructor() {
		super( ...arguments );
		this.state = {
			adSlots: [],
		};
	}

	componentDidMount() {
		return apiFetch( { path: '/newspack/v1/wizard/adslots' } )
			.then( adSlots => {
				// Convert the JSON robject response into a Dropdown array
				const result = Object.values(adSlots).map( adSlot => {
					return { label: adSlot.name, value: adSlot.id };
				} );
				return new Promise( resolve => {
					this.setState(
						{
							adSlots: result,
						},
						() => {
							resolve( this.state );
						}
					);
				} );
			} )
			.catch( error => {
				console.log(error);
			} );
	}

	render() {
		/**
		 * Constants
		 */
		const { attributes, setAttributes } = this.props;
		const { className, activeAd } = attributes;
		const { adSlots } = this.state;

		return (
			<Fragment>
				<div className={ className }>
					{ activeAd && (
						<p>{ __( 'Hello, please choose an advert.' ) }</p>
					) }
					{ ! activeAd && (
						<p>{ __( 'Displaying ad #%s', activeAd ) }</p>
					) }
				</div>
				<InspectorControls>
					<SelectControl
						label={ __('Advert') }
						value={ activeAd }
						options={ adSlots }
						onChange={ ( activeAd ) => { setAttributes( { activeAd: activeAd } ) } }
					>
					</SelectControl>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default Edit;
