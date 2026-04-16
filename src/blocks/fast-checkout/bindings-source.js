/**
 * Fast Checkout block bindings source — editor side.
 *
 * Registers a bindings source that resolves fields (title, image_url, etc.)
 * from the product whose ID is provided by Fast Checkout block context.
 */

import { registerBlockBindingsSource } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

const SOURCE_NAME = 'newspack-blocks/fast-checkout-product';
const PRODUCT_CONTEXT_KEY = 'newspack-blocks/fastCheckoutProductId';
const VARIATION_CONTEXT_KEY = 'newspack-blocks/fastCheckoutVariationId';

const productCache = new Map();
const pendingFetches = new Map();

/**
 * Fetch a product from the WooCommerce Store API and cache it.
 *
 * @param {number|string} productId
 * @return {Promise<Object|null>} Cached or fetched product record.
 */
export function fetchProduct( productId ) {
	const id = parseInt( productId, 10 );
	if ( ! id ) {
		return Promise.resolve( null );
	}
	if ( productCache.has( id ) ) {
		return Promise.resolve( productCache.get( id ) );
	}
	if ( pendingFetches.has( id ) ) {
		return pendingFetches.get( id );
	}
	const promise = apiFetch( { path: `/wc/store/v1/products/${ id }` } )
		.then( product => {
			productCache.set( id, product );
			pendingFetches.delete( id );
			return product;
		} )
		.catch( () => {
			productCache.set( id, null );
			pendingFetches.delete( id );
			return null;
		} );
	pendingFetches.set( id, promise );
	return promise;
}

/**
 * Pull a single field from a cached Store API product record.
 *
 * @param {Object} product Store API product record.
 * @param {string} field   Field name.
 * @return {string} Resolved field value.
 */
function readField( product, field ) {
	if ( ! product ) {
		return '';
	}
	switch ( field ) {
		case 'title':
			return product.name || '';
		case 'short_description':
			return product.short_description || '';
		case 'price':
			return product.price_html || '';
		case 'price_raw':
			return product.prices?.price || '';
		case 'image_url':
			return product.images?.[ 0 ]?.src || '';
		case 'url':
			return product.permalink || '';
		default:
			return '';
	}
}

registerBlockBindingsSource( {
	name: SOURCE_NAME,
	label: __( 'Fast Checkout Product', 'newspack-blocks' ),
	usesContext: [ PRODUCT_CONTEXT_KEY, VARIATION_CONTEXT_KEY ],
	getValues( { bindings, context } ) {
		const variationId = parseInt( context?.[ VARIATION_CONTEXT_KEY ], 10 ) || 0;
		const productId = parseInt( context?.[ PRODUCT_CONTEXT_KEY ], 10 ) || 0;
		const resolvedId = variationId || productId;
		const product = resolvedId ? productCache.get( resolvedId ) : null;

		// Trigger a fetch if we have an ID but no cache entry yet.
		// The next render cycle picks up the cached value once resolved.
		if ( resolvedId && ! productCache.has( resolvedId ) ) {
			fetchProduct( resolvedId );
		}

		const result = {};
		for ( const [ attr, binding ] of Object.entries( bindings ) ) {
			const field = binding?.args?.field;
			result[ attr ] = field ? readField( product, field ) : '';
		}
		return result;
	},
} );
