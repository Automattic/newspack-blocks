/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { SelectControl, Placeholder } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies.
 */
import { icon } from './';

class Edit extends Component {

	/**
	 * Constructor.
	 */
	constructor() {
		super( ...arguments );
		this.state = {
			adUnits: [],
		};
	}

	componentDidMount() {
		return apiFetch( { path: '/newspack/v1/wizard/adunits' } )
			.then( adUnits => {
				return new Promise( resolve => {
					this.setState(
						{
							adUnits: adUnits,
							activeAdData: this.dataForActiveAdUnit(),
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

	adUnitsForSelect = () => {
		const { adUnits } = this.state;
		return Object.values( adUnits ).map( adUnit => {
			return {
				label: adUnit.name,
				value: adUnit.id
			};
		} );
	};

	dataForActiveAdUnit = () => {
		const { attributes } = this.props;
		const { activeAd } = attributes;
		const { adUnits } = this.state;

		return adUnits.find( unit => unit.id === activeAd );
	}

	render() {
		/**
		 * Constants
		 */
		const { attributes, setAttributes } = this.props;
		const { activeAd } = attributes;
		const { adUnits, activeAdData } = this.state;

		return (
			<Fragment>
				<InspectorControls>
					<SelectControl
						label={ __('Advert') }
						value={ activeAd }
						options={ this.adUnitsForSelect() }
						onChange={ ( activeAd ) => {
							setAttributes( {
								activeAd: activeAd,
							} );
							this.setState( {
								activeAdData: this.dataForAdUnit(), // @todo grab ad data from adUnits
							} );
						} }
					>
					</SelectControl>
				</InspectorControls>
				<div className={ `wp-block-newspack-blocks-google-ad-manager` }>
					<div
						className="newspack-gam-ad"
						style={ {
							width: activeAdData.width,
							height: activeAdData.height,
						} }
						>
						<Placeholder
							icon={ icon }
							label={ __('Advert') }
						/>
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Edit;
