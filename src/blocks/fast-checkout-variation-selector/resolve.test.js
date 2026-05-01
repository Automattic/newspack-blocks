import { resolveVariationId } from './resolve';

describe( 'resolveVariationId', () => {
	const variations = [
		{ id: 1, attributes: { attribute_color: 'red', attribute_size: 's' }, is_in_stock: true },
		{ id: 2, attributes: { attribute_color: 'red', attribute_size: 'm' }, is_in_stock: true },
		{ id: 3, attributes: { attribute_color: 'blue', attribute_size: 's' }, is_in_stock: true },
		{ id: 4, attributes: { attribute_color: 'blue', attribute_size: 'm' }, is_in_stock: true },
	];

	it( 'returns null when not all attributes are picked', () => {
		const selection = { attribute_color: 'red' };
		expect( resolveVariationId( variations, selection ) ).toBeNull();
	} );

	it( 'returns matching variation id when all attributes picked', () => {
		const selection = { attribute_color: 'blue', attribute_size: 'm' };
		expect( resolveVariationId( variations, selection ) ).toBe( 4 );
	} );

	it( 'returns null when selection has no matching variation', () => {
		const selection = { attribute_color: 'green', attribute_size: 'l' };
		expect( resolveVariationId( variations, selection ) ).toBeNull();
	} );
} );
