/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { loadStripe } from '@stripe/stripe-js/pure';
import 'regenerator-runtime'; // Required in WP >=5.8.

/**
 * Internal dependencies
 */
import './streamlined.scss';

const isValidEmail = string => /\S+@\S+/.test( string );
const validateFormData = values => {
	const errors = {};
	if ( ! isValidEmail( values.email ) ) {
		errors.email = __( 'Email address is invalid.', 'newspack-blocks' );
	}
	if ( values.amount <= 0 ) {
		errors.amount = __( 'Amount must be greater than zero.', 'newspack-blocks' );
	}
	if ( values.full_name.length === 0 ) {
		errors.amount = __( 'Full name should be provided.', 'newspack-blocks' );
	}
	return errors;
};

const renderMessages = ( messages, el, type = 'error' ) => {
	el.innerHTML = '';
	messages.forEach( message => {
		const messageEl = document.createElement( 'div' );
		messageEl.classList.add( `type-${ type }` );
		messageEl.innerHTML = message;
		el.appendChild( messageEl );
	} );
};

const getCookies = () =>
	document.cookie.split( '; ' ).reduce( ( acc, cookieStr ) => {
		const cookie = cookieStr.split( '=' );
		acc[ cookie[ 0 ] ] = cookie[ 1 ];
		return acc;
	}, {} );

const getClientIDValue = () => getCookies()[ 'newspack-cid' ];

const getAmount = formValues => {
	const valueKey = `donation_value_${ formValues.donation_frequency }`;
	formValues.amount = formValues[ valueKey ];
	if ( formValues.amount === 'other' ) {
		formValues.amount = formValues[ `${ valueKey }_other` ];
	}
	if ( ! formValues.amount ) {
		formValues.amount = formValues[ `${ valueKey }_untiered` ];
	}
	return parseFloat( formValues.amount );
};

export const computeFeeAmount = ( amount, feeMultiplier, feeStatic ) => {
	return parseFloat(
		( ( ( amount + feeStatic ) / ( 100 - feeMultiplier ) ) * 100 - amount ).toFixed( 2 )
	);
};

const getFeeAmount = formElement => {
	const formValues = Object.fromEntries( new FormData( formElement ) );
	const amount = getAmount( formValues );
	// eslint-disable-next-line no-unused-vars, @wordpress/no-unused-vars-before-return
	const [ CURRENCY_SYMBOL, FREQUENCIES, FEE_MULTIPLIER, FEE_STATIC ] = JSON.parse(
		formElement.getAttribute( 'data-settings' )
	);
	return computeFeeAmount( amount, parseFloat( FEE_MULTIPLIER ), parseFloat( FEE_STATIC ) );
};

export const processStreamlinedElements = ( parentElement = document ) =>
	[ ...parentElement.querySelectorAll( '.stripe-payment' ) ].forEach( async el => {
		const disableForm = () => el.classList.add( 'stripe-payment--disabled' );
		const enableForm = () => el.classList.remove( 'stripe-payment--disabled' );
		enableForm();

		let stripe, cardElement;
		const initStripe = async () => {
			const stripePublishableKey = el.getAttribute( 'data-stripe-pub-key' );
			stripe = await loadStripe( stripePublishableKey );

			const elements = stripe.elements();

			cardElement = elements.create( 'card' );
			cardElement.mount( el.querySelector( '.stripe-payment__card' ) );
		};

		// Handle initial form unravelling.
		const submitButtonEl = el.querySelector( 'button[type="submit"]' );
		submitButtonEl.onclick = e => {
			const inputsHiddenEl = el.querySelector( '.stripe-payment__inputs--hidden' );
			if ( inputsHiddenEl ) {
				e.preventDefault();
				initStripe();
				inputsHiddenEl.classList.remove( 'stripe-payment__inputs--hidden' );
			}
		};

		const messagesEl = el.querySelector( '.stripe-payment__messages' );

		const renderGenericError = () =>
			renderMessages(
				[
					__( 'Something went wrong with the payment. Please try again later.', 'newspack-blocks' ),
				],
				messagesEl
			);
		const renderSuccessMessageWithEmail = emailAddress => {
			const successMessge = sprintf(
				/* Translators: %s is the email address of the donor. */
				__(
					'Your payment has been processed. Thank you for your contribution! You will receive a confirmation email at %s.',
					'newspack-blocks'
				),
				emailAddress
			);
			renderMessages( [ successMessge ], messagesEl, 'success' );
		};

		const formElement = el.closest( 'form' );
		const [ CURRENCY_SYMBOL, FREQUENCIES ] = JSON.parse(
			formElement.getAttribute( 'data-settings' )
		);

		const updateFeesAmount = () => {
			const feesAmountEl = el.querySelector( '#stripe-fees-amount' );
			if ( feesAmountEl ) {
				const formValues = Object.fromEntries( new FormData( formElement ) );
				const feeAmount = getFeeAmount( formElement );
				feesAmountEl.innerHTML = `(${ CURRENCY_SYMBOL }${ feeAmount.toFixed( 2 ) } ${ FREQUENCIES[
					formValues.donation_frequency
				].toLowerCase() })`;
			}
		};

		updateFeesAmount();
		formElement.onchange = () => {
			updateFeesAmount();
		};
		formElement.onsubmit = async e => {
			e.preventDefault();
			disableForm();
			renderMessages( [ __( 'Processing payment…', 'newspack-blocks' ) ], messagesEl, 'info' );

			const formValues = Object.fromEntries( new FormData( formElement ) );
			formValues.amount = getAmount( formValues );
			if ( formValues.cid.indexOf( 'CLIENT_ID' ) === 0 ) {
				// In non-AMP environment, the value will not be dynamically substituted by AMP runtime.
				formValues.cid = getClientIDValue();
			}

			const validationErrors = Object.values( validateFormData( formValues ) );
			if ( validationErrors.length > 0 ) {
				renderMessages( validationErrors, messagesEl );
				enableForm();
				return;
			}

			const stripeTokenCreationResult = await stripe.createToken( cardElement );
			if ( stripeTokenCreationResult.error ) {
				validationErrors.push( stripeTokenCreationResult.error.message );
				renderMessages( validationErrors, messagesEl );
				enableForm();
				return;
			}
			let amount = formValues.amount;
			if ( formValues.agree_to_pay_fees ) {
				amount = amount + getFeeAmount( formElement );
			}
			const chargeResult = await fetch( '/wp-json/newspack-blocks/v1/donate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					tokenData: stripeTokenCreationResult.token,
					amount,
					email: formValues.email,
					full_name: formValues.full_name,
					frequency: formValues.donation_frequency,
					newsletter_opt_in: Boolean( formValues.newsletter_opt_in ),
					clientId: formValues.cid,
				} ),
			} );

			const chargeResultData = await chargeResult.json();

			// Error handling.
			if ( chargeResultData.data?.status !== 200 && chargeResultData.message ) {
				renderMessages( [ chargeResultData.message ], messagesEl );
			}
			if ( chargeResultData.error ) {
				renderMessages( [ chargeResultData.error ], messagesEl );
			}

			// Additional authentication handling.
			if ( chargeResultData.client_secret ) {
				const { paymentIntent, error } = await stripe.confirmCardPayment(
					chargeResultData.client_secret,
					{
						payment_method: { card: cardElement },
					}
				);
				if ( error ) {
					renderMessages( [ error.message ], messagesEl );
					enableForm();
				} else if ( paymentIntent.status === 'succeeded' ) {
					// Payment Intent statuses: https://stripe.com/docs/payments/intents#intent-statuses
					renderSuccessMessageWithEmail( formValues.email );
				} else {
					renderGenericError();
				}
			}

			if ( chargeResultData.status === 'success' ) {
				renderSuccessMessageWithEmail( formValues.email );
			}
		};
	} );

processStreamlinedElements();
