import * as testingLibrary from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock-jest';
import { encode } from 'html-entities';

import { processStreamlinedElements, computeFeeAmount } from './streamlined';

const MONTHLY_AMOUNT = 7;

const createDOM = settings => {
	const parentElement = document.createElement( 'div' );
	parentElement.innerHTML = `
		<style>.stripe-payment__inputs--hidden {display:none;}</style>
		<form data-settings="${ encode( JSON.stringify( settings ) ) }">
			<div class='frequencies'>
				<div class='frequency'>
					<input type="radio" value="once" id="once" name="donation_frequency">
					<label for="once">Once</label>
				</div>
				<div class='frequency'>
					<input type="radio" value="month" id="month" name="donation_frequency" checked>
					<label for="month">Monthly</label>
					<input type="radio" name="donation_value_month" value="${ MONTHLY_AMOUNT }" checked />
				</div>
			</div>
			<div class="stripe-payment">
				<div class="stripe-payment__inputs--hidden">
					<input required="" placeholder="Email" type="email" name="email" value="">
					<input required="" placeholder="Full Name" type="text" name="full_name" value="">
				</div>
				<label>
					<input type="checkbox" name="agree_to_pay_fees" checked value="true">Agree to pay fees?
					<span id="stripe-fees-amount">($0)</span>
				</label>
				<div class="stripe-payment__messages"></div>
				<button type="submit">Donate</button>
			</div>
			<input name="cid" type="hidden" value="amp-123" />
		</form>
	`;
	document.body.appendChild( parentElement );
	return document.body;
};

describe( 'fee computation', () => {
	it( 'computes fee with default values', () => {
		expect( computeFeeAmount( 1, 2.9, 0.3 ) ).toBe( 0.34 );
		expect( computeFeeAmount( 15, 2.9, 0.3 ) ).toBe( 0.76 );
		expect( computeFeeAmount( 100, 2.9, 0.3 ) ).toBe( 3.3 );
	} );
	it( 'computes fee with other values', () => {
		expect( computeFeeAmount( 15, 0, 0 ) ).toBe( 0 );
		expect( computeFeeAmount( 15, 2.3, 0.3 ) ).toBe( 0.66 );
		expect( computeFeeAmount( 15, 2.3, 0 ) ).toBe( 0.35 );
		expect( computeFeeAmount( 15, 50, 0 ) ).toBe( 15 );
		expect( computeFeeAmount( 15, 50, 10 ) ).toBe( 35 );
	} );
} );

describe( 'Streamlined Donate block processing', () => {
	fetchMock.post( '/wp-json/newspack-blocks/v1/donate', () => {
		return { data: { status: 200, client_secret: 'sec_123' } };
	} );

	const currencySymbol = '$';
	const frequencies = { once: 'Once', month: 'Monthly', year: 'Annually' };
	const feeMultiplier = '2.9';
	const feeStatic = '0.3';
	const settings = [ currencySymbol, frequencies, feeMultiplier, feeStatic ];
	const container = createDOM( settings );
	processStreamlinedElements( container );

	const button = testingLibrary.getByText( container, 'Donate' );
	const emailInput = testingLibrary.getByPlaceholderText( container, 'Email' );
	const nameInput = testingLibrary.getByPlaceholderText( container, 'Full Name' );

	it( 'additional inputs are initially hidden and displayed after user clicks the button', () => {
		expect( emailInput ).not.toBeVisible();
		userEvent.click( button );
		expect( emailInput ).toBeVisible();
	} );

	it( 'form submission with invalid values triggers validation errors', () => {
		userEvent.click( button );
		expect(
			testingLibrary.getByText( container, 'Email address is invalid.' )
		).toBeInTheDocument();
		expect(
			testingLibrary.getByText( container, 'Full name should be provided.' )
		).toBeInTheDocument();

		userEvent.type( emailInput, 'foo@bar.com' );
		userEvent.click( button );
		expect(
			testingLibrary.queryByText( container, 'Email address is invalid.' )
		).not.toBeInTheDocument();
	} );

	it( 'the fee amount is updated', () => {
		expect( testingLibrary.getByText( container, '($0.52 monthly)' ) ).toBeInTheDocument();
	} );

	it( 'form can be submitted after validation passes', () => {
		userEvent.type( nameInput, 'Bax' );
		userEvent.click( button );
		expect(
			testingLibrary.queryByText( container, 'Full name should be provided.' )
		).not.toBeInTheDocument();
		expect( testingLibrary.getByText( container, 'Processing payment…' ) ).toBeInTheDocument();
	} );
} );
