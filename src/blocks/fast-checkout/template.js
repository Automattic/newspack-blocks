/**
 * Default inner-block template for the Fast Checkout block.
 *
 * The Woo Checkout block carries its own lock attribute so it cannot be removed
 * or reordered, while the rest of the template stays editable.
 */

const BINDING_SOURCE = 'newspack-blocks/fast-checkout-product';

const bind = field => ( { source: BINDING_SOURCE, args: { field } } );

export const DEFAULT_TEMPLATE = [
	[
		'core/image',
		{
			metadata: {
				bindings: {
					url: bind( 'image_url' ),
					alt: bind( 'title' ),
				},
			},
		},
	],
	[
		'core/heading',
		{
			level: 2,
			metadata: {
				bindings: {
					content: bind( 'title' ),
				},
			},
		},
	],
	[
		'core/paragraph',
		{
			metadata: {
				bindings: {
					content: bind( 'short_description' ),
				},
			},
		},
	],
	[ 'woocommerce/checkout', { lock: { remove: true, move: true } } ],
];
