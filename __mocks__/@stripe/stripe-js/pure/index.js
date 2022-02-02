import 'regenerator-runtime';

export const loadStripe = async () => {
	return {
		elements: () => ( {
			create: () => ( {
				mount: () => {},
			} ),
		} ),
		createToken: () => ( {
			token: 'abc',
			error: null,
		} ),
		paymentRequest: () => ( { canMakePayment: () => false, on: () => {}, update: () => {} } ),
		confirmCardPayment: () => ( {
			paymentIntent: { status: 'succeeded' },
		} ),
	};
};
