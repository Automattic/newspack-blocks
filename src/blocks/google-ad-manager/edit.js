/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls, BlockControls } from '@wordpress/editor';
import { SelectControl, Placeholder } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies.
 */
import { icon } from './';
import FormatPicker from './format-picker';
import { AD_FORMATS } from './constants';

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
				// Convert the JSON robject response into a Dropdown array
				const result = Object.values(adUnits).map( adUnit => {
					return { label: adUnit.name, value: adUnit.id };
				} );
				return new Promise( resolve => {
					this.setState(
						{
							adUnits: result,
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
		const { activeAd, format } = attributes;
		const { adUnits } = this.state;
		const selectedFormatObject = AD_FORMATS.filter( ( { tag } ) => tag === format )[ 0 ];

		return (
			<Fragment>
				<InspectorControls>
					<SelectControl
						label={ __('Advert') }
						value={ activeAd }
						options={ adUnits }
						onChange={ ( activeAd ) => {
							setAttributes( { activeAd: activeAd } );
						} }
					>
					</SelectControl>
				</InspectorControls>
				<BlockControls>
					<FormatPicker
						value={ format }
						onChange={ nextFormat => setAttributes( { format: nextFormat } ) }
					/>
				</BlockControls>
				<div className={ `wp-block-newspack-blocks-google-ad-manager newspack-gam-ad-${ format }` }>
					<div
						className="newspack-gam-ad"
						style={ {
							width: selectedFormatObject.width,
							height: selectedFormatObject.height + selectedFormatObject.editorPadding,
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
