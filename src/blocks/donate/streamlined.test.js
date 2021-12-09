import * as testingLibrary from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock-jest';

import { processStreamlinedElements } from './streamlined';

const createDOM = () => {
	const parentElement = document.createElement( 'div' );
	parentElement.innerHTML = `
    <style>.stripe-payment__inputs--hidden {display:none;}</style>
    <form>
      <div class='frequencies'>
        <input type="radio" value="once" id="once" name="donation_frequency">
        <label for="once">Once</label>
        <input type="radio" value="monthly" id="monthly" name="donation_frequency" checked>
        <label for="monthly">Monthly</label>
      </div>
      <div class="stripe-payment">
        <div class="stripe-payment__inputs--hidden">
					<input required="" placeholder="Email" type="email" name="email" value="">
					<input required="" placeholder="Full Name" type="text" name="full_name" value="">
				</div>
        <div class="stripe-payment__messages"></div>
        <button type="submit">Donate</button>
      </div>
  		<input name="cid" type="hidden" value="amp-123" />
    </form>
  `;
	document.body.appendChild( parentElement );
	return document.body;
};

describe( 'Streamlined Donate block processing', () => {
	fetchMock.post( '/wp-json/newspack-blocks/v1/donate', () => {
		return { data: { status: 200, client_secret: 'sec_123' } };
	} );

	const container = createDOM();
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

	it( 'form can be submitted after validation passes', () => {
		userEvent.type( nameInput, 'Bax' );
		userEvent.click( button );
		expect(
			testingLibrary.queryByText( container, 'Full name should be provided.' )
		).not.toBeInTheDocument();
		expect( testingLibrary.getByText( container, 'Processing payment…' ) ).toBeInTheDocument();
	} );
} );
