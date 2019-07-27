/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Component, Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';
import {
	CheckboxControl,
	PanelBody,
	Spinner,
	RadioControl,
	TextControl,
	ExternalLink,
} from '@wordpress/components';

class Edit extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			suggestedAmounts: [ 0, 0, 0 ],
			suggestedAmountUntiered: 0,
			currencySymbol: '$',
			tiered: false,
			created: false,

			isLoading: false,
			activeTier: 1,
			selectedFrequency: 'month',
			customDonationAmount: 0,
			error: '',
		}
	}

	componentDidMount() {
		this.getSettings();
	}

	getSettings() {
		const path = '/newspack/v1/wizard/newspack-donations-wizard/donation';

		this.setState( { isLoading: true }, () => {
			apiFetch( { path } ).then( settings => {
				const { suggestedAmounts, suggestedAmountUntiered, currencySymbol, tiered, created } = settings;
				this.setState( {
					suggestedAmounts,
					suggestedAmountUntiered,
					currencySymbol,
					tiered,
					created,
					isLoading: false,
					customDonationAmount: tiered ? suggestedAmounts[1] : suggestedAmountUntiered,
					activeTier: suggestedAmounts[1],
				} );
			} )
			.catch( error => {
				this.setState( {
					isLoading: false,
					error: error.message
				} );
			} );
		} );
	}

	render() {
		const { className } = this.props;
		const { 
			suggestedAmounts,
			suggestedAmountUntiered,
			currencySymbol,
			tiered,
			created,

			isLoading,
			activeTier,
			selectedFrequency,
			customDonationAmount,
			error,
		} = this.state;

		if ( isLoading ) {
			return (
				<div className={ classNames( className, 'loading' ) }>
					<Spinner />
				</div>
			);
		}

		if ( error.length ) {
			return (
				<div className={ classNames( className, 'not-ready' ) }>
					<p>{ error }</p>
				</div>
			);
		}

		if ( ! created ) {
			return (
				<div className={ classNames( className, 'not-ready' ) }>
					<p>{ __( 'You have not set up your donation settings yet. You need to do that before you can use the Donate Block.' ) }</p>
					<ExternalLink href='/wp-admin/admin.php?page=newspack-donations-wizard#/'>
						{ __( 'Set up donation settings.' ) }
					</ExternalLink>
				</div>
			);
		}

		const tierOptions = suggestedAmounts.map( amt => ( 
			{ 
				label: 'year' === selectedFrequency ? currencySymbol + ( 12 * amt ) : currencySymbol + amt, 
				value: amt,
			} 
		) );
		tierOptions.push( { label: __( 'Other' ), value: 'other' } );

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
									options={ tierOptions }
									onChange={ activeTier => this.setState( { activeTier } ) }
								/>
							) }
							{ ( ! tiered || 'other' === activeTier ) && (
								<div className='wp-block-newspack-blocks-donate__money-input'>
									<span className='currency'>{ currencySymbol }</span>
									<TextControl
										type='number'
										label={ __( 'Donation amount' ) }
										value={ customDonationAmount }
										onChange={ customDonationAmount => this.setState( { customDonationAmount } ) }
									/>
								</div>
							) }
							<p className='info-message'>{ __( 'Your contribution is appreciated.' ) }</p>
							<button className="primary" onClick={ evt => evt.preventDefault() } >{ __( 'Donate now!' ) }</button>
						</div>
					</form>
				</div>
				<InspectorControls>
					<PanelBody title={ __( 'Donate Block' ) }>
						<p>{ __( 'The Donate Block allows you to collect donations from readers. The fields are automatically defined based on your donation settings.' ) }</p>
						<ExternalLink href='/wp-admin/admin.php?page=newspack-donations-wizard#/'>
							{ __( 'Edit donation settings.' ) }
						</ExternalLink>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default Edit;
