/**
 * Fast Checkout Variation Selector — frontend.
 *
 * Hydrates SSR-rendered <form> elements, listens to radio changes, resolves
 * to a variation ID once all attributes are picked, and swaps the cart
 * line via the WC Store API cart store.
 *
 * NOTE on attribute key shape: WooCommerce's get_available_variation() calls
 * $variation->get_variation_attributes() with $with_prefix=true (default),
 * so the data-variations JSON has PREFIXED keys (e.g. "attribute_color").
 * Radio inputs also have prefixed names (e.g. name="attribute_color").
 * Keys match directly — no extra prefix translation needed.
 */

import { createRoot, useEffect, useMemo, useState } from '@wordpress/element';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import './view.scss';

const STORE = 'wc/store/cart' as const;

interface VariationData {
	id: number;
	attributes: Record< string, string >;
	is_in_stock: boolean;
}

interface RootProps {
	host: HTMLFormElement;
	productId: number;
	variations: VariationData[];
	currentVariationId: number;
}

function readCurrentSelections( host: HTMLFormElement ): Record< string, string > {
	const result: Record< string, string > = {};
	host.querySelectorAll< HTMLInputElement >( 'input[type="radio"]:checked' ).forEach( input => {
		result[ input.name ] = input.value;
	} );
	return result;
}

/**
 * Check whether a variation's attributes match the current DOM selection.
 *
 * Both the variation attributes (from data-variations JSON) and the radio input
 * names have the "attribute_" prefix, so keys align directly.
 */
function attributesMatch( variation: VariationData, selection: Record< string, string > ): boolean {
	return Object.entries( variation.attributes ).every( ( [ key, value ] ) => selection[ key ] === value );
}

function resolveVariationId( variations: VariationData[], selection: Record< string, string > ): number | null {
	const required = new Set< string >();
	variations.forEach( v => Object.keys( v.attributes ).forEach( k => required.add( k ) ) );
	for ( const key of required ) {
		if ( ! selection[ key ] ) {
			return null;
		}
	}
	const match = variations.find( v => attributesMatch( v, selection ) );
	return match ? match.id : null;
}

function VariationSelector( { host, productId, variations, currentVariationId }: RootProps ) {
	const [ pendingId, setPendingId ] = useState< number >( currentVariationId );
	const [ inFlight, setInFlight ] = useState( false );
	const [ error, setError ] = useState< string >( '' );

	const noticeNode = useMemo< HTMLElement | null >(
		() => host.querySelector( '.wp-block-newspack-blocks-fast-checkout-variation-selector__notice' ),
		[ host ]
	);

	useEffect( () => {
		if ( noticeNode ) {
			if ( error ) {
				noticeNode.textContent = error;
				noticeNode.removeAttribute( 'hidden' );
			} else {
				noticeNode.textContent = '';
				noticeNode.setAttribute( 'hidden', '' );
			}
		}
	}, [ error, noticeNode ] );

	useEffect( () => {
		const onChange = async () => {
			setError( '' );
			const selection = readCurrentSelections( host );
			const resolvedId = resolveVariationId( variations, selection );
			if ( ! resolvedId || resolvedId === pendingId ) {
				return;
			}
			setInFlight( true );
			try {
				await swapCartItem( productId, pendingId, resolvedId );
				setPendingId( resolvedId );
				updateUrlParam( 'fc_variation', String( resolvedId ) );
			} catch ( e: unknown ) {
				setError( ( e as Error )?.message || __( 'Could not update selection.', 'newspack-blocks' ) );
				revertSelection( host, pendingId, variations );
			} finally {
				setInFlight( false );
			}
		};
		host.addEventListener( 'change', onChange );
		return () => host.removeEventListener( 'change', onChange );
	}, [ host, productId, variations, pendingId ] );

	useEffect( () => {
		const onPopstate = () => {
			const params = new URLSearchParams( window.location.search );
			const next = parseInt( params.get( 'fc_variation' ) || '', 10 );
			if ( next && next !== pendingId ) {
				const variation = variations.find( v => v.id === next );
				if ( variation ) {
					setPendingId( next );
					applySelectionToDom( host, variation );
				}
			}
		};
		window.addEventListener( 'popstate', onPopstate );
		return () => window.removeEventListener( 'popstate', onPopstate );
	}, [ host, variations, pendingId ] );

	useEffect( () => {
		host.querySelectorAll< HTMLInputElement >( 'input[type="radio"]' ).forEach( input => {
			input.disabled = inFlight;
		} );
	}, [ host, inFlight ] );

	return null;
}

/**
 * Apply a variation's attribute selections to the DOM radio inputs.
 *
 * Attribute keys in VariationData already carry the "attribute_" prefix
 * (matching the radio input name attributes), so no prefix translation needed.
 */
function applySelectionToDom( host: HTMLFormElement, variation: VariationData ) {
	Object.entries( variation.attributes ).forEach( ( [ key, value ] ) => {
		const radio = host.querySelector< HTMLInputElement >( `input[type="radio"][name="${ key }"][value="${ value }"]` );
		if ( radio ) {
			radio.checked = true;
		}
	} );
}

function revertSelection( host: HTMLFormElement, currentId: number, variations: VariationData[] ) {
	const variation = variations.find( v => v.id === currentId );
	if ( variation ) {
		applySelectionToDom( host, variation );
	}
}

async function swapCartItem( parentProductId: number, oldVariationId: number, newVariationId: number ) {
	const cartActions = dispatch( STORE );
	const cartSelectors = select( STORE );
	const cart = cartSelectors.getCartData();
	const items = cart?.items || [];
	const existing = items.find( ( item: { id?: number; variation?: { value?: string }[] } ) => {
		const itemVariationId = Number(
			item.variation?.find( ( v: { attribute?: string; value?: string } ) => v.attribute === 'variation_id' )?.value
		);
		return itemVariationId === oldVariationId || item.id === parentProductId;
	} );

	if ( existing ) {
		await (
			cartActions as {
				removeItemFromCart: ( key: string ) => Promise< unknown >;
			}
		 ).removeItemFromCart( ( existing as { key: string } ).key );
	}

	await (
		cartActions as {
			addItemToCart: ( productId: number, quantity: number, variation?: { attribute: string; value: string }[] ) => Promise< unknown >;
		}
	 ).addItemToCart( parentProductId, 1, [ { attribute: 'variation_id', value: String( newVariationId ) } ] );
}

function updateUrlParam( key: string, value: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( key, value );
	window.history.replaceState( {}, '', url.toString() );
}

function init() {
	document.querySelectorAll< HTMLFormElement >( '.wp-block-newspack-blocks-fast-checkout-variation-selector' ).forEach( host => {
		const productId = parseInt( host.dataset.productId || '0', 10 );
		let variations: VariationData[] = [];
		try {
			variations = JSON.parse( host.dataset.variations || '[]' );
		} catch {
			variations = [];
		}
		if ( ! productId || ! variations.length ) {
			return;
		}
		const currentVariationId = parseInt( host.dataset.currentVariation || '0', 10 );
		const sentinel = document.createElement( 'span' );
		sentinel.style.display = 'none';
		host.appendChild( sentinel );
		const root = createRoot( sentinel );
		root.render(
			<VariationSelector host={ host } productId={ productId } variations={ variations } currentVariationId={ currentVariationId } />
		);
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
