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

	render() {
		/**
		 * Constants
		 */
		const { attributes, setAttributes } = this.props;
		const { activeAd } = attributes;
		const { adUnits } = this.state;
		const activeAdData = adUnits.find( adUnit => parseInt( adUnit.id ) === parseInt( activeAd ) );
		const style = activeAdData && {
			width: `${ activeAdData.width }px`,
			height: `${ activeAdData.height }px`,
		};
		return (
			<Fragment>
				<InspectorControls>
					<SelectControl
						label={ __( 'Advert' ) }
						value={ activeAd }
						options={ this.adUnitsForSelect( adUnits ) }
						onChange={ activeAd => setAttributes( { activeAd } ) }
					/>
				</InspectorControls>
				<div className="wp-block-newspack-blocks-google-ad-manager">
					<div className="newspack-gam-ad" style={ style }>
						<Placeholder icon={ icon } label={ __( 'Advert' ) } />
					</div>
				</div>
			</Fragment>
		);
	}
}

export default Edit;
