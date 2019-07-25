/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { createRef, Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import {
	CheckboxControl,
	ToggleControl,
	PanelBody,
	PanelRow,
	QueryControls,
	RangeControl,
	Toolbar,
	Dashicon,
	Placeholder,
	Spinner,
	RadioControl,
	TextControl,
	ExternalLink,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import donateBlock from './donate';

class Edit extends Component {
	constructor( props ) {
		super( props );
		//this.blockRef = createRef();
		this.state = {
			name: __( 'Donate' ),
			suggestedAmount: 0,
			suggestedAmountLow: 0,
			suggestedAmountHigh: 0,
			tiered: false,

			isLoading: false,
			activeTier: 'middle',
			selectedFrequency: 'month',
			customDonationAmount: 0,
		}
	}

	componentDidMount() {
		//donateBlock( this.blockRef.current, true );
		this.getSettings();
	}

	getSettings() {
		const path = '/newspack/v1/wizard/newspack-donations-wizard/donation';

		this.setState( { isLoading: true }, () => {
			apiFetch( { path } ).then( settings => {
				const { name, suggestedAmount, suggestedAmountLow, suggestedAmountHigh, tiered } = settings;
				this.setState( {
					name,
					suggestedAmount,
					suggestedAmountLow,
					suggestedAmountHigh,
					tiered,
					isLoading: false,
					customDonationAmount: suggestedAmount,
				} );
			} )
			.catch( error => {
				console.log( error );
			} );
		} );
	}

	render() {
		/**
		 * Constants
		 */
		const { className } = this.props;
		const { 
			name,
			suggestedAmount,
			suggestedAmountLow,
			suggestedAmountHigh,
			tiered,

			isLoading,
			activeTier,
			selectedFrequency,
			customDonationAmount,
		} = this.state;

		if ( isLoading ) {
			return 'Loading . . . ';
		}

		return (
			<Fragment>
				<div className={ classNames( className, tiered ? 'tiered' : '' ) }>
					<form>
						<RadioControl
							className='wp-block-newspack-blocks-donate__frequency-selection'
							selected={ selectedFrequency }
							options={ [
								{ label: __( 'One-time' ), value: 'once' },
								{ label: __( 'Monthly' ), value: 'month' },
								{ label: __( 'Annually' ), value: 'year' },
							] }
							onChange={ selectedFrequency => this.setState( { selectedFrequency } ) }
						/>
						<div className='wp-block-newspack-blocks-donate__settings-container'>
							{ tiered && (
								<RadioControl
									className='wp-block-newspack-blocks-donate__tier-selection'
									selected={ activeTier }
									options={ [
										{ label: 'year' === selectedFrequency ? 12 * suggestedAmountLow : suggestedAmountLow, value: 'low' },
										{ label: 'year' === selectedFrequency ? 12 * suggestedAmount : suggestedAmount, value: 'middle' },
										{ label: 'year' === selectedFrequency ? 12 * suggestedAmountHigh : suggestedAmountHigh, value: 'high' },
										{ label: __( 'Other' ), value: 'other' },
									] }
									onChange={ activeTier => this.setState( { activeTier } ) }
								/>
							) }
							{ ( ! tiered || 'other' === activeTier ) && (
								<TextControl
									type='number'
									className='wp-block-newspack-blocks-donate__manual-price'
									label={ __( 'Donation amount' ) }
									value={ customDonationAmount }
									onChange={ customDonationAmount => this.setState( { customDonationAmount } ) }
								/>
							) }
							<p className='info-message'>{ __( 'Your contribution is appreciated.' ) }</p>
							<button className="primary" onClick={ () => {} }>{ __( 'Donate now!' ) }</button>
						</div>
					</form>
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Donate Block' ) }>
						<p>{ __( 'The Donate Block allows you to collect donations from readers. The fields are automatically defined based on your donation settings.' ) }</p>
						<ExternalLink href='/wp-admin/admin.php?page=newspack-donations-wizard#/'>
							{ __( 'Edit donation settings.' ) }
						</ExternalLink>{' '}
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default Edit;
