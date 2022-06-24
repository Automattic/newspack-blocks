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
import { useState, useEffect, useMemo, useRef } from '@wordpress/element';
import {
	PanelBody,
	ExternalLink,
	Placeholder,
	Spinner,
	SelectControl,
	ToggleControl,
	TextControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import { InspectorControls, RichText } from '@wordpress/block-editor';
import { isEmpty } from 'lodash';

type FrequencySlug = 'once' | 'month' | 'year';

const FREQUENCIES: { [ Key in FrequencySlug as string ]: string } = {
	once: __( 'One-time', 'newspack-blocks' ),
	month: __( 'Monthly', 'newspack-blocks' ),
	year: __( 'Annually', 'newspack-blocks' ),
};
const FREQUENCY_SLUGS: FrequencySlug[] = Object.keys( FREQUENCIES ) as FrequencySlug[];

type DonationAmounts = {
	[ Key in FrequencySlug as string ]: [ number, number, number, number ];
};

type OverridableConfiguration = {
	amounts: DonationAmounts;
	tiered: boolean;
	disabledFrequencies: {
		[ Key in FrequencySlug as string ]: boolean;
	};
};

type DonateBlockAttributes = OverridableConfiguration & {
	buttonText: string;
	thanksText: string;
	defaultFrequency: FrequencySlug;
	campaign: string;
	// Manual mode enables block-level overrides of the global Donate settings.
	manual: boolean;
	// Legacy attributes.
	suggestedAmounts?: [ number, number, number ];
	suggestedAmountUntiered?: number;
};
type EditProps = {
	attributes: DonateBlockAttributes;
	setAttributes: ( attributes: Partial< DonateBlockAttributes > ) => void;
	className: string;
};
type DonationSettings = OverridableConfiguration & {
	currencySymbol: string;
};

type EditState = DonationSettings;

const getMigratedAmount = (
	frequency: FrequencySlug,
	amounts: [ number, number, number ],
	untieredAmount: number
): [ number, number, number, number ] => {
	const multiplier = frequency === 'month' ? 1 : 12;
	return [
		amounts[ 0 ] * multiplier,
		amounts[ 1 ] * multiplier,
		amounts[ 2 ] * multiplier,
		untieredAmount * multiplier,
	];
};

const Edit = ( { attributes, setAttributes, className }: EditProps ) => {
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState( '' );

	// Unique identifier to prevent collisions with other Donate blocks' labels.
	const uid = useMemo( () => Math.random().toString( 16 ).slice( 2 ), [] );

	const [ settings, setSettings ] = hooks.useObjectState< EditState >( {
		amounts: {},
		currencySymbol: '$',
		tiered: false,
		disabledFrequencies: {},
	} );

	useEffect( () => {
		apiFetch< DonationSettings >( {
			path: '/newspack/v1/wizard/newspack-reader-revenue-wizard/donations',
		} )
			.then( ( settings: DonationSettings ) => {
				setSettings( {
					amounts: settings.amounts,
					currencySymbol: settings.currencySymbol,
					tiered: settings.tiered,
					disabledFrequencies: settings.disabledFrequencies,
				} );

				if ( isEmpty( attributes.disabledFrequencies ) ) {
					setAttributes( { disabledFrequencies: settings.disabledFrequencies } );
				}

				// Migrate old attributes.
				if (
					isEmpty( attributes.amounts ) &&
					attributes.suggestedAmounts &&
					attributes.suggestedAmounts.length
				) {
					const untieredAmount = attributes.suggestedAmountUntiered || settings.amounts.month[ 3 ];
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
					setAttributes( { amounts: { ...settings.amounts, ...attributes.amounts } } );
				}
			} )
			.catch( setError )
			.finally( () => setIsLoading( false ) );
	}, [] );

	const isRenderingStreamlinedBlock = () =>
		window.newspack_blocks_data?.is_rendering_streamlined_block;

	const amounts = attributes.manual ? attributes.amounts : settings.amounts;
	const availableFrequencies = FREQUENCY_SLUGS.filter( slug =>
		attributes.manual
			? ! attributes.disabledFrequencies[ slug ]
			: ! settings.disabledFrequencies[ slug ]
	);

	const formRef = useRef< HTMLFormElement >( null );

	useEffect( () => {
		if ( formRef.current ) {
			const formValues = Object.fromEntries( new FormData( formRef.current ) );
			if ( ! formValues.donation_frequency && formRef.current.elements ) {
				const frequencyRadioInput = formRef.current.elements[ 0 ];
				if ( frequencyRadioInput instanceof HTMLInputElement ) {
					frequencyRadioInput.click();
				}
			}
		}
		if ( availableFrequencies.indexOf( attributes.defaultFrequency ) === -1 ) {
			setAttributes( { defaultFrequency: availableFrequencies[ 0 ] } );
		}
	}, [ attributes.disabledFrequencies ] );

	const handleCustomDonationChange = ( {
		value,
		frequency,
		tierIndex,
	}: {
		value: string;
		frequency: FrequencySlug;
		tierIndex: number;
	} ) => {
		const subject = attributes.manual ? attributes : settings;
		subject.amounts[ frequency ][ tierIndex ] = parseFloat( value );
		const update: Partial< DonateBlockAttributes > = {
			amounts: {
				[ frequency ]: subject.amounts[ frequency ],
				...subject.amounts,
			},
		};

		if ( attributes.manual ) {
			setAttributes( update );
		} else {
			setSettings( update );
		}
	};

	const renderFrequencySelect = ( frequencySlug: FrequencySlug ) => (
		<>
			<input
				type="radio"
				value={ frequencySlug }
				id={ `newspack-donate-${ frequencySlug }-${ uid }` }
				name="donation_frequency"
				defaultChecked={ frequencySlug === attributes.defaultFrequency }
			/>
			<label
				htmlFor={ 'newspack-donate-' + frequencySlug + '-' + uid }
				className="donation-frequency-label freq-label"
			>
				{ FREQUENCIES[ frequencySlug ] }
			</label>
		</>
	);

	const displayAmount = ( amount: number ) => amount.toFixed( 2 ).replace( /\.?0*$/, '' );
	const getClassNames = ( classes: string ) =>
		classNames(
			classes,
			className,
			'wpbnbd',
			`wpbnbd-frequencies--${ availableFrequencies.length }`
		);

	const renderUntieredForm = () => (
		<div className="wp-block-newspack-blocks-donate__options">
			{ availableFrequencies.map( frequencySlug => (
				<div className="wp-block-newspack-blocks-donate__frequency frequency" key={ frequencySlug }>
					{ renderFrequencySelect( frequencySlug ) }
					<div className="input-container">
						<label
							className="donate-label"
							htmlFor={ 'newspack-' + frequencySlug + '-' + uid + '-untiered-input' }
						>
							{ __( 'Donation amount', 'newspack-blocks' ) }
						</label>
						<div className="wp-block-newspack-blocks-donate__money-input money-input">
							<span className="currency">{ settings.currencySymbol }</span>
							<input
								type="number"
								min="0"
								onChange={ evt =>
									handleCustomDonationChange( {
										value: evt.target.value,
										frequency: frequencySlug,
										tierIndex: 3,
									} )
								}
								value={ amounts[ frequencySlug ][ 3 ] }
								id={ 'newspack-' + frequencySlug + '-' + uid + '-untiered-input' }
							/>
						</div>
					</div>
				</div>
			) ) }
		</div>
	);

	const renderAmountValueInput = (
		frequencySlug: FrequencySlug,
		tierIndex: number,
		id: string
	) => (
		<input
			type="number"
			min="0"
			onChange={ evt =>
				handleCustomDonationChange( {
					value: evt.target.value,
					frequency: frequencySlug,
					tierIndex,
				} )
			}
			value={ amounts[ frequencySlug ][ tierIndex ] }
			id={ id }
		/>
	);

	const renderTieredForm = () => (
		<div className="wp-block-newspack-blocks-donate__options">
			<div className="wp-block-newspack-blocks-donate__frequencies frequencies">
				{ availableFrequencies.map( frequencySlug => (
					<div
						className="wp-block-newspack-blocks-donate__frequency frequency"
						key={ frequencySlug }
					>
						{ renderFrequencySelect( frequencySlug ) }

						<div className="wp-block-newspack-blocks-donate__tiers tiers">
							{ amounts[ frequencySlug ].map( ( suggestedAmount, index ) => {
								const isOtherTier = index === 3;
								const id = `newspack-tier-${ frequencySlug }-${ uid }-${
									isOtherTier ? 'other' : index
								}`;
								return (
									<div
										className={ classNames(
											'wp-block-newspack-blocks-donate__tier',
											`wp-block-newspack-blocks-donate__tier--${
												isOtherTier ? 'other' : 'frequency'
											}`
										) }
										key={ index }
									>
										<input
											type="radio"
											value={ isOtherTier ? 'other' : suggestedAmount }
											className={ isOtherTier ? 'other-input' : 'frequency-input' }
											id={ id }
											name={ `donation_value_${ frequencySlug }` }
											defaultChecked={ index === 1 }
										/>
										<label className="tier-select-label tier-label" htmlFor={ id }>
											{ isOtherTier
												? __( 'Other', 'newspack-blocks' )
												: settings.currencySymbol + displayAmount( suggestedAmount ) }
										</label>
										{ isOtherTier ? (
											<>
												<label className="odl" htmlFor={ id + '-other-input' }>
													{ __( 'Donation amount', 'newspack-blocks' ) }
												</label>
												<div className="wp-block-newspack-blocks-donate__money-input money-input">
													<span className="currency">{ settings.currencySymbol }</span>
													{ renderAmountValueInput( frequencySlug, index, id + '-other-input' ) }
												</div>
											</>
										) : attributes.manual ? (
											renderAmountValueInput( frequencySlug, index, id )
										) : null }
									</div>
								);
							} ) }
						</div>
					</div>
				) ) }
			</div>
		</div>
	);

	const renderButton = () => (
		<button type="submit" onClick={ evt => evt.preventDefault() }>
			{ isRenderingStreamlinedBlock() ? (
				__( 'Donate with card', 'newspack-blocks' )
			) : (
				<RichText
					onChange={ ( value: string ) => setAttributes( { buttonText: value } ) }
					placeholder={ __( 'Button text…', 'newspack-blocks' ) }
					value={ attributes.buttonText }
					tagName="span"
				/>
			) }
		</button>
	);

	const renderFooter = () => (
		<>
			<p className="wp-block-newspack-blocks-donate__thanks thanks">
				<RichText
					onChange={ ( value: string ) => setAttributes( { thanksText: value } ) }
					placeholder={ __( 'Thank you text…', 'newspack-blocks' ) }
					value={ attributes.thanksText }
					tagName="span"
				/>
			</p>
			{ isRenderingStreamlinedBlock() ? (
				<div className="wp-block-newspack-blocks-donate__stripe stripe-payment">
					<div className="stripe-payment__row stripe-payment__row--flex stripe-payment__footer">
						<div className="stripe-payment__methods">
							<div className="stripe-payment__request-button">
								{ __( 'Apple/Google Pay Button', 'newspack-blocks' ) }
							</div>
							{ renderButton() }
						</div>
						<a
							target="_blank"
							rel="noreferrer"
							className="stripe-payment__branding"
							href="https://stripe.com"
						>
							<img
								width="111"
								height="26"
								src={ window.newspack_blocks_data?.streamlined_block_stripe_badge }
								alt="Stripe"
							/>
						</a>
					</div>
				</div>
			) : (
				renderButton()
			) }
		</>
	);

	if ( error.length ) {
		return (
			<Placeholder icon="warning" label={ __( 'Error', 'newspack-blocks' ) } instructions={ error }>
				<ExternalLink href="/wp-admin/admin.php?page=newspack-reader-revenue-wizard#/donations">
					{ __( 'Go to donation settings to troubleshoot.', 'newspack-blocks' ) }
				</ExternalLink>
			</Placeholder>
		);
	}

	if ( isLoading ) {
		return <Placeholder icon={ <Spinner /> } className="component-placeholder__align-center" />;
	}

	const isTiered = attributes.manual ? attributes.tiered : settings.tiered;

	return (
		<>
			<div className={ getClassNames( isTiered ? 'tiered' : 'untiered' ) }>
				<form ref={ formRef }>
					{ isTiered ? renderTieredForm() : renderUntieredForm() }
					{ renderFooter() }
				</form>
			</div>

			<InspectorControls>
				<PanelBody title={ __( 'Donate Settings', 'newspack-blocks' ) }>
					<SelectControl
						label={ __( 'Default Tab', 'newspack' ) }
						value={ attributes.defaultFrequency }
						options={ availableFrequencies.map( key => ( {
							label: FREQUENCIES[ key ],
							value: key,
						} ) ) }
						onChange={ ( defaultFrequency: FrequencySlug ) =>
							setAttributes( { defaultFrequency } )
						}
					/>
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
							<ButtonGroup>
								{ FREQUENCY_SLUGS.map( ( frequency: FrequencySlug ) => {
									const isFrequencyDisabled = attributes.disabledFrequencies[ frequency ];
									const isOneFrequencyActive =
										Object.values( attributes.disabledFrequencies ).filter( Boolean ).length ===
										FREQUENCY_SLUGS.length - 1;
									return (
										<Button
											key={ frequency }
											variant={ isFrequencyDisabled ? '' : 'primary' }
											disabled={ ! isFrequencyDisabled && isOneFrequencyActive }
											onClick={ () => {
												setAttributes( {
													disabledFrequencies: {
														...attributes.disabledFrequencies,
														[ frequency ]: ! isFrequencyDisabled,
													},
												} );
											} }
										>
											{ FREQUENCIES[ frequency ] }
										</Button>
									);
								} ) }
							</ButtonGroup>
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
