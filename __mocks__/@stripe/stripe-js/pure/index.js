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
	};
};
