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
import { PanelBody, ExternalLink, Placeholder, Spinner } from '@wordpress/components';

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
			customDonationAmounts: {
				once: 0,
				month: 0,
				year: 0,
			},
			error: '',
		};
	}

	componentDidMount() {
		this.getSettings();
	}

	getSettings() {
		const path = '/newspack/v1/wizard/newspack-donations-wizard/donation';

		this.setState( { isLoading: true }, () => {
			apiFetch( { path } )
				.then( settings => {
					const {
						suggestedAmounts,
						suggestedAmountUntiered,
						currencySymbol,
						tiered,
						created,
					} = settings;
					this.setState( {
						suggestedAmounts,
						suggestedAmountUntiered,
						currencySymbol,
						tiered,
						created,
						isLoading: false,
						customDonationAmounts: {
							once: tiered ? 12 * suggestedAmounts[ 1 ] : 12 * suggestedAmountUntiered,
							month: tiered ? suggestedAmounts[ 1 ] : suggestedAmountUntiered,
							year: tiered ? 12 * suggestedAmounts[ 1 ] : 12 * suggestedAmountUntiered,
						},
						activeTier: 1,
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

	handleCustomDonationChange( evt, frequency ) {
		const { customDonationAmounts } = this.state;
		customDonationAmounts[ frequency ] = evt.target.value;
		this.setState( { customDonationAmounts } );
	}

	renderUntieredForm() {
		const { className } = this.props;
		const { currencySymbol, selectedFrequency, customDonationAmounts, error } = this.state;

		const frequencies = {
			once: __( 'One-time', 'newspack-blocks' ),
			month: __( 'Monthly', 'newspack-blocks' ),
			year: __( 'Annually', 'newspack-blocks' ),
		};

		return (
			<div className={ classNames( className, 'untiered' ) }>
				<form>
					<div className="wp-block-newspack-blocks-donate__options">
						{ Object.keys( frequencies ).map( frequencySlug => (
							<div className="wp-block-newspack-blocks-donate__frequency">
								<input
									type="radio"
									onClick={ () => this.setState( { selectedFrequency: frequencySlug } ) }
									id={ 'newspack-donate-' + frequencySlug }
									name="donation_frequency"
									checked={ frequencySlug === selectedFrequency }
								/>
								<label
									htmlFor={ 'newspack-donate-' + frequencySlug }
									className="donation-frequency-label"
								>
									{ frequencies[ frequencySlug ] }
								</label>
								<div className="input-container">
									<label
										className="donate-label"
										htmlFor={ 'newspack-' + frequencySlug + '-untiered-input' }
									>
										{ __( 'Donation amount', 'newspack-blocks' ) }
									</label>
									<div className="wp-block-newspack-blocks-donate__money-input">
										<span className="currency">{ currencySymbol }</span>
										<input
											type="number"
											onChange={ evt => this.handleCustomDonationChange( evt, frequencySlug ) }
											value={ customDonationAmounts[ frequencySlug ] }
											id={ 'newspack-' + frequencySlug + '-untiered-input' }
										/>
									</div>
								</div>
							</div>
						) ) }
					</div>
					<p className="wp-block-newspack-blocks-donate__thanks">
						{ __( 'Your contribution is appreciated.', 'newspack-blocks' ) }
					</p>
					<button type="submit" onClick={ evt => evt.preventDefault() }>
						{ __( 'Donate now!', 'newspack-blocks' ) }
					</button>
				</form>
			</div>
		);
	}

	renderTieredForm() {
		const { className } = this.props;
		const {
			suggestedAmounts,
			currencySymbol,
			activeTier,
			selectedFrequency,
			customDonationAmounts,
		} = this.state;

		const frequencies = {
			once: __( 'One-time', 'newspack-blocks' ),
			month: __( 'Monthly', 'newspack-blocks' ),
			year: __( 'Annually', 'newspack-blocks' ),
		};

		return (
			<div className={ classNames( className, 'tiered' ) }>
				<form>
					<div className="wp-block-newspack-blocks-donate__options">
						<div className="wp-block-newspack-blocks-donate__frequencies">
							{ Object.keys( frequencies ).map( frequencySlug => (
								<div className="wp-block-newspack-blocks-donate__frequency">
									<input
										type="radio"
										onClick={ () => this.setState( { selectedFrequency: frequencySlug } ) }
										id={ 'newspack-donate-' + frequencySlug }
										name="donation_frequency"
										checked={ frequencySlug === selectedFrequency }
									/>
									<label
										htmlFor={ 'newspack-donate-' + frequencySlug }
										className="donation-frequency-label"
									>
										{ frequencies[ frequencySlug ] }
									</label>

									<div className="wp-block-newspack-blocks-donate__tiers">
										{ suggestedAmounts.map( ( suggestedAmount, index ) => (
											<div className="wp-block-newspack-blocks-donate__tier">
												<input
													type="radio"
													onClick={ () => this.setState( { activeTier: index } ) }
													id={ 'newspack-tier-' + frequencySlug + '-' + index }
													checked={ index === activeTier }
												/>
												<label
													className="tier-select-label"
													htmlFor={ 'newspack-tier-' + frequencySlug + '-' + index }
												>
													{ currencySymbol +
														( 'year' === frequencySlug || 'once' == frequencySlug
															? 12 * suggestedAmount
															: suggestedAmount ) }
												</label>
											</div>
										) ) }

										<div className="wp-block-newspack-blocks-donate__tier">
											<input
												type="radio"
												onClick={ () => this.setState( { activeTier: 'other' } ) }
												className="other-input"
												id={ 'newspack-tier-' + frequencySlug + '-other' }
												checked={ 'other' === activeTier }
											/>
											<label
												className="tier-select-label"
												htmlFor={ 'newspack-tier-' + frequencySlug + '-other' }
											>
												{ __( 'Other', 'newspack-blocks' ) }
											</label>
											<label
												className="other-donate-label"
												htmlFor={ 'newspack-tier-' + frequencySlug + '-other-input' }
											>
												{ __( 'Donation amount', 'newspack-blocks' ) }
											</label>
											<div className="wp-block-newspack-blocks-donate__money-input">
												<span className="currency">{ currencySymbol }</span>
												<input
													type="number"
													onChange={ evt => this.handleCustomDonationChange( evt, frequencySlug ) }
													value={ customDonationAmounts[ frequencySlug ] }
													id={ 'newspack-tier-' + frequencySlug + '-other-input' }
												/>
											</div>
										</div>
									</div>
								</div>
							) ) }
						</div>
					</div>
					<p className="wp-block-newspack-blocks-donate__thanks">
						{ __( 'Your contribution is appreciated.', 'newspack-blocks' ) }
					</p>
					<button type="submit" onClick={ evt => evt.preventDefault() }>
						{ __( 'Donate now!', 'newspack-blocks' ) }
					</button>
				</form>
			</div>
		);
	}

	render() {
		const { className } = this.props;
		const { tiered, created, isLoading, error } = this.state;

		if ( isLoading ) {
			return <Placeholder icon={ <Spinner /> } />;
		}

		if ( error.length ) {
			return (
				<Placeholder
					icon="warning"
					label={ __( 'Error', 'newspack-blocks' ) }
					instructions={ error }
				>
					<ExternalLink href="/wp-admin/admin.php?page=newspack-donations-wizard#/">
						{ __( 'Go to donation settings to troubleshoot.', 'newspack-blocks' ) }
					</ExternalLink>
				</Placeholder>
			);
		}

		if ( ! created ) {
			return (
				<Placeholder
					icon="warning"
					label={ __( 'Not ready', 'newspack-blocks' ) }
					instructions={ __(
						'You have not set up your donation settings yet. You need to do that before you can use the Donate Block.',
						'newspack-blocks'
					) }
				>
					<ExternalLink href="/wp-admin/admin.php?page=newspack-donations-wizard#/">
						{ __( 'Set up donation settings.', 'newspack-blocks' ) }
					</ExternalLink>
				</Placeholder>
			);
		}

		let form;
		if ( ! tiered ) {
			form = this.renderUntieredForm();
		} else {
			form = this.renderTieredForm();
		}

		return (
			<Fragment>
				{ form }
				<InspectorControls>
					<PanelBody title={ __( 'Donate Block', 'newspack-blocks' ) }>
						<p>
							{ __(
								'The Donate Block allows you to collect donations from readers. The fields are automatically defined based on your donation settings.',
								'newspack-blocks'
							) }
						</p>
						<ExternalLink href="/wp-admin/admin.php?page=newspack-donations-wizard#/">
							{ __( 'Edit donation settings.', 'newspack-blocks' ) }
						</ExternalLink>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	}
}

export default Edit;
