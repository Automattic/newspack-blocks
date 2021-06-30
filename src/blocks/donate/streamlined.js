/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import { loadStripe } from '@stripe/stripe-js';

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

[ ...document.querySelectorAll( '.stripe-payment' ) ].forEach( async el => {
	const disableForm = () => el.classList.add( 'stripe-payment--disabled' );
	const enableForm = () => el.classList.remove( 'stripe-payment--disabled' );

	const stripePublishableKey = el.getAttribute( 'data-stripe-pub-key' );
	const stripe = await loadStripe( stripePublishableKey );
	enableForm();

	const elements = stripe.elements();

	const cardElement = elements.create( 'card' );
	cardElement.mount( el.querySelector( '.stripe-payment__card' ) );

	const messagesEl = el.querySelector( '.stripe-payment__messages' );

	const formElement = el.closest( 'form' );
	formElement.onsubmit = async e => {
		e.preventDefault();
		disableForm();

		const formValues = Object.fromEntries( new FormData( e.target ) );
		const valueKey = `donation_value_${ formValues.donation_frequency }`;
		formValues.amount = formValues[ valueKey ];
		if ( formValues.amount === 'other' ) {
			formValues.amount = formValues[ `${ valueKey }_other` ];
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
		const chargeResult = await fetch( '/wp-json/newspack-blocks/v1/donate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( {
				tokenData: stripeTokenCreationResult.token,
				amount: formValues.amount,
				email: formValues.email,
				frequency: formValues.donation_frequency,
			} ),
		} );
		const chargeResultData = await chargeResult.json();
		if ( chargeResultData.error ) {
			renderMessages( [ chargeResultData.error ], messagesEl );
		}
		if ( chargeResultData.client_secret ) {
			const { paymentIntent, error } = await stripe.confirmCardPayment(
				chargeResultData.client_secret,
				{
					payment_method: { card: cardElement },
				}
			);
			if ( error ) {
				renderMessages( [ error.message ], messagesEl );
			} else if ( paymentIntent.status === 'succeeded' ) {
				// Payment Intent statuses: https://stripe.com/docs/payments/intents#intent-statuses
				renderMessages( [ __( 'Thank you!', 'newspack-blocks' ) ], messagesEl, 'success' );
			} else {
				renderMessages(
					[
						__(
							'Something went wrong with the payment. Please try again later.',
							'newspack-blocks'
						),
					],
					messagesEl
				);
			}
		}
		enableForm();
	};
} );
