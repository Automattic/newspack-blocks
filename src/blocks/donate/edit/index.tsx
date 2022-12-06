/**
 * External dependencies
 */
import classNames from 'classnames';
import { hooks } from 'newspack-components';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect, Fragment } from '@wordpress/element';
import {
	CheckboxControl,
	PanelBody,
	ExternalLink,
	Placeholder,
	Spinner,
	SelectControl,
	ToggleControl,
	TextControl,
	Button,
} from '@wordpress/components';
import { InspectorControls, ColorPaletteControl } from '@wordpress/block-editor';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { getMigratedAmount } from '../utils';
import type {
	DonateBlockAttributes,
	DonationSettings,
	DonationFrequencySlug,
	EditState,
} from '../types';
import TierBasedLayout from './TierBasedLayout';
import FrequencyBasedLayout from './FrequencyBasedLayout';
import { AmountValueInput } from './components';
import {
	FREQUENCIES,
	FREQUENCY_SLUGS,
	LAYOUT_OPTIONS,
	DISABLED_IN_TIERS_BASED_LAYOUT_TIER_INDEX,
} from '../consts';

type EditProps = {
	attributes: DonateBlockAttributes;
	setAttributes: ( attributes: Partial< DonateBlockAttributes > ) => void;
	className: string;
};

const TIER_LABELS = [
	__( 'Low-tier', 'newspack' ),
	__( 'Mid-tier', 'newspack' ),
	__( 'High-tier', 'newspack' ),
	__( 'Other', 'newspack' ),
];

const Edit = ( { attributes, setAttributes, className }: EditProps ) => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState( '' );

	const [ settings, setSettings ] = hooks.useObjectState< EditState >( {
		amounts: {},
		currencySymbol: '$',
		tiered: false,
		disabledFrequencies: {},
		minimumDonation: 5,
		platform: '',
	} );

	useEffect( () => {
		apiFetch< DonationSettings >( {
			path: '/newspack/v1/wizard/newspack-reader-revenue-wizard/donations',
		} )
			.then( ( donationSettings: DonationSettings ) => {
				setSettings( {
					amounts: donationSettings.amounts,
					currencySymbol: donationSettings.currencySymbol,
					tiered: donationSettings.tiered,
					disabledFrequencies: donationSettings.disabledFrequencies,
					minimumDonation: donationSettings.minimumDonation,
					platform: donationSettings.platform,
				} );

				if ( isEmpty( attributes.disabledFrequencies ) ) {
					setAttributes( { disabledFrequencies: donationSettings.disabledFrequencies } );
				}

				if ( isEmpty( attributes.minimumDonation ) ) {
					setAttributes( { minimumDonation: donationSettings.minimumDonation } );
				}

				// Migrate old attributes.
				if (
					isEmpty( attributes.amounts ) &&
					attributes.suggestedAmounts &&
					attributes.suggestedAmounts.length
				) {
					const untieredAmount =
						attributes.suggestedAmountUntiered || donationSettings.amounts.month[ 3 ];
					setAttributes( {
						suggestedAmounts: undefined,
						suggestedAmountUntiered: undefined,
						amounts: {
							once: getMigratedAmount( 'once', attributes.suggestedAmounts, untieredAmount ),
							month: getMigratedAmount( 'month', attributes.suggestedAmounts, untieredAmount ),
							year: getMigratedAmount( 'year', attributes.suggestedAmounts, untieredAmount ),
						},
					} );
				} else {
					setAttributes( { amounts: { ...donationSettings.amounts, ...attributes.amounts } } );
				}
			} )
			.catch( setError )
			.finally( () => setIsLoading( false ) );
	}, [] );

	if ( error.length ) {
		return (
			<Placeholder icon="warning" label={ __( 'Error', 'newspack-blocks' ) } instructions={ error }>
				<ExternalLink href="/wp-admin/admin.php?page=newspack-reader-revenue-wizard#/donations">
					{ __( 'Go to donation settings to troubleshoot.', 'newspack-blocks' ) }
				</ExternalLink>
			</Placeholder>
		);
	}

	if ( settings.platform === 'other' ) {
		return (
			<Placeholder
				icon="warning"
				label={ __( 'The Donate block will not be rendered.', 'newspack-blocks' ) }
				instructions={ __( 'The Reader Revenue platform is set to "other".', 'newspack' ) }
			>
				<ExternalLink href="/wp-admin/admin.php?page=newspack-reader-revenue-wizard#/donations">
					{ __( 'Go to donation settings to update the platform.', 'newspack-blocks' ) }
				</ExternalLink>
			</Placeholder>
		);
	}

	if ( isLoading ) {
		return <Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />;
	}

	const isTiered = attributes.manual ? attributes.tiered : settings.tiered;
	const isRenderingStripePaymentForm =
		window.newspack_blocks_data?.is_rendering_stripe_payment_form;
	const isTierBasedLayoutEnabled =
		isRenderingStripePaymentForm && isTiered && attributes.layoutOption === 'tiers';

	const amounts = attributes.manual ? attributes.amounts : settings.amounts;
	const availableFrequencies = FREQUENCY_SLUGS.filter( slug =>
		attributes.manual
			? ! attributes.disabledFrequencies[ slug ]
			: ! settings.disabledFrequencies[ slug ]
	).filter( slug => ( isTierBasedLayoutEnabled ? slug !== 'once' : true ) );

	// Editor bug – initially, the default style is selected, but the class not applied.
	if ( className.indexOf( 'is-style' ) === -1 ) {
		className = className + ' is-style-default';
	}
	const getWrapperClassNames = ( classes: string[] = [] ) =>
		classNames(
			classes,
			className,
			'wpbnbd',
			`wpbnbd--${ isTierBasedLayoutEnabled ? 'tiers-based' : 'frequency-based' }`,
			`wpbnbd-frequencies--${ availableFrequencies.length }`
		);

	const componentProps = {
		attributes,
		amounts,
		availableFrequencies,
		settings,
		setAttributes,
		setSettings,
	};

	return (
		<>
			{ isTierBasedLayoutEnabled ? (
				<div className={ getWrapperClassNames() }>
					<TierBasedLayout { ...componentProps } />
				</div>
			) : (
				<div className={ getWrapperClassNames( [ isTiered ? 'tiered' : 'untiered' ] ) }>
					<FrequencyBasedLayout isTiered={ isTiered } { ...componentProps } />
				</div>
			) }

			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'newspack-blocks' ) }>
					<div className="newspack-blocks-layout-selector">
						{ LAYOUT_OPTIONS.map( ( { label, key } ) => {
							let isSelected, disabled;
							switch ( key ) {
								case 'tiers':
									isSelected = isTierBasedLayoutEnabled;
									disabled = ( key === 'tiers' && ! isTiered ) || ! isRenderingStripePaymentForm;
									break;
								case 'frequency':
									isSelected = ! isTierBasedLayoutEnabled;
									break;
							}
							return (
								<Button
									key={ key }
									variant={ isSelected ? 'primary' : 'secondary' }
									isPressed={ isSelected }
									onClick={ () => setAttributes( { layoutOption: key } ) }
									aria-current={ isSelected }
									disabled={ disabled }
								>
									{ label }
								</Button>
							);
						} ) }
					</div>
					{ ! isTierBasedLayoutEnabled && (
						<SelectControl
							label={ __( 'Default Tab', 'newspack' ) }
							value={ attributes.defaultFrequency }
							options={ availableFrequencies.map( key => ( {
								label: FREQUENCIES[ key ],
								value: key,
							} ) ) }
							onChange={ ( defaultFrequency: DonationFrequencySlug ) =>
								setAttributes( { defaultFrequency } )
							}
						/>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Suggested Donations', 'newspack-blocks' ) }>
					<ToggleControl
						checked={ Boolean( attributes.manual ) }
						onChange={ () => setAttributes( { manual: ! attributes.manual } ) }
						label={ __( 'Configure manually', 'newspack-blocks' ) }
					/>
					{ attributes.manual ? (
						<>
							<ToggleControl
								checked={ Boolean( attributes.tiered ) }
								onChange={ () => setAttributes( { tiered: ! attributes.tiered } ) }
								label={ __( 'Tiered', 'newspack-blocks' ) }
							/>
							{ attributes.tiered ? (
								<>
									<div className="components-frequency-donations">
										{ availableFrequencies.map( ( frequency: DonationFrequencySlug ) => {
											const isFrequencyDisabled = attributes.disabledFrequencies[ frequency ];
											const isOneFrequencyActive =
												Object.values( attributes.disabledFrequencies ).filter( Boolean ).length ===
												availableFrequencies.length - 1;
											return (
												<Fragment key={ frequency }>
													<CheckboxControl
														label={ FREQUENCIES[ frequency ] }
														checked={ ! isFrequencyDisabled }
														disabled={ ! isFrequencyDisabled && isOneFrequencyActive }
														onChange={ () => {
															setAttributes( {
																disabledFrequencies: {
																	...attributes.disabledFrequencies,
																	[ frequency ]: ! isFrequencyDisabled,
																},
															} );
														} }
													/>
													{ ! isFrequencyDisabled && (
														<div className="wp-block-newspack-blocks-donate__panel-inputs">
															{ amounts[ frequency ].reduce(
																( acc: boolean, suggestedAmount: number ) => {
																	if ( suggestedAmount < attributes.minimumDonation ) {
																		return true;
																	}
																	return acc;
																},
																false
															) && (
																<p className="components-frequency-donations__error">
																	{ __(
																		'Warning: suggested donations should be at least the minimum donation amount.',
																		'newspack-blocks'
																	) }
																</p>
															) }
															{ amounts[ frequency ].map( ( suggestedAmount, tierIndex ) => (
																<AmountValueInput
																	ignoreMinimumAmount
																	{ ...componentProps }
																	key={ `amount-${ frequency }-${ tierIndex }` }
																	frequencySlug={ frequency }
																	tierIndex={ tierIndex }
																	label={ TIER_LABELS[ tierIndex ] }
																	id={ `${ frequency }-${ tierIndex }-amount` }
																	disabled={
																		isTierBasedLayoutEnabled &&
																		tierIndex === DISABLED_IN_TIERS_BASED_LAYOUT_TIER_INDEX
																	}
																/>
															) ) }
														</div>
													) }
												</Fragment>
											);
										} ) }
									</div>
								</>
							) : (
								<div className="components-frequency-donations">
									<div className="wp-block-newspack-blocks-donate__panel-inputs">
										{ FREQUENCY_SLUGS.reduce(
											( acc: boolean, frequencySlug: DonationFrequencySlug ) => {
												if ( amounts[ frequencySlug ][ 3 ] < attributes.minimumDonation ) {
													return true;
												}
												return acc;
											},
											false
										) && (
											<p className="components-frequency-donations__error">
												{ __(
													'Warning: suggested donations should be at least the minimum donation amount.',
													'newspack-blocks'
												) }
											</p>
										) }
										{ FREQUENCY_SLUGS.map( ( frequencySlug: DonationFrequencySlug ) => (
											<AmountValueInput
												ignoreMinimumAmount
												{ ...componentProps }
												key={ frequencySlug }
												frequencySlug={ frequencySlug }
												tierIndex={ 3 }
												label={ FREQUENCIES[ frequencySlug ] }
												id={ `${ frequencySlug }-${ 3 }-amount` }
											/>
										) ) }
									</div>
								</div>
							) }
							<TextControl
								className="components-frequency-donations__minimum-donation"
								type="number"
								label={ __( 'Minimum donation', 'newspack-blocks' ) }
								min={ 1 }
								onChange={ ( value: number ) => setAttributes( { minimumDonation: value } ) }
								value={ attributes.minimumDonation }
							/>
						</>
					) : (
						<p>
							{ __(
								'The Donate Block allows you to collect donations from readers. The fields are automatically defined based on your donation settings.',
								'newspack-blocks'
							) }
							<br />
							<br />
							<ExternalLink href="/wp-admin/admin.php?page=newspack-reader-revenue-wizard#/donations">
								{ __( 'Edit donation settings', 'newspack-blocks' ) }
							</ExternalLink>
						</p>
					) }
				</PanelBody>
				<PanelBody title={ __( 'Styling', 'newspack-blocks' ) } initialOpen={ false }>
					<ColorPaletteControl
						value={ attributes.buttonColor }
						onChange={ ( buttonColor: string ) => setAttributes( { buttonColor } ) }
						label={ __( 'Button Color', 'newspack-blocks' ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Campaign', 'newspack-blocks' ) } initialOpen={ false }>
					<TextControl
						label={ __( 'Campaign ID', 'newspack-blocks' ) }
						value={ attributes.campaign || '' }
						onChange={ ( value: string ) =>
							setAttributes( {
								campaign: value,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
};

export default Edit;
