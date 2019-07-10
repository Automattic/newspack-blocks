/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import { SelectControl, Placeholder } from '@wordpress/components';
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
		apiFetch( { path: '/newspack/v1/wizard/adunits' } ).then( adUnits =>
			this.setState( { adUnits } )
		);
	}

	adUnitsForSelect = adUnits => {
		return Object.values( adUnits ).map( adUnit => {
			return {
				label: adUnit.name,
				value: adUnit.id,
			};
		} );
	};

	dimensionsFromAd = adData => {
		const { code } = adData || {};
		const widthRegex = /width[:=].*?([0-9].*?)(?:px|\s)/i;
		const width = ( code || '' ).match( widthRegex );
		const heightRegex = /height[:=].*?([0-9].*?)(?:px|\s)/i;
		const height = ( code || '' ).match( heightRegex );
		return {
			width: width ? parseInt( width[ 1 ] ) : 0,
			height: height ? parseInt( height[ 1 ] ) : 0,
		};
	};

	render() {
		/**
		 * Constants
		 */
		const { attributes, setAttributes } = this.props;
		const { activeAd } = attributes;
		const { adUnits } = this.state;
		const activeAdData = adUnits.find( adUnit => parseInt( adUnit.id ) === parseInt( activeAd ) );
		const { width, height } = this.dimensionsFromAd( activeAdData );
		const style = {
			width: `${ width }px`,
			height: `${ height }px`,
		};
		const dimensions = width && height ? ` (${ width } x ${ height })` : '';
		return (
			<Fragment>
				<InspectorControls>
					<SelectControl
						label={ __( 'Ad Unit' ) }
						value={ activeAd }
						options={ this.adUnitsForSelect( adUnits ) }
						onChange={ activeAd => setAttributes( { activeAd } ) }
					/>
				</InspectorControls>
				<div className="wp-block-newspack-blocks-google-ad-manager">
					{ !! activeAdData && (
						<div className="newspack-gam-ad" style={ style }>
							<Placeholder icon={ icon } label={ __( 'Ad Unit' ) + dimensions } />
						</div>
					) }
					{ ! activeAdData && (
						<div className="newspack-gam-ad">
							<Placeholder icon={ icon } label={ __( 'Select an Ad Unit' ) } />
						</div>
					) }
				</div>
			</Fragment>
		);
	}
}

export default Edit;
