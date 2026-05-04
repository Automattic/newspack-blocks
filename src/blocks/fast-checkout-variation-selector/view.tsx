/**
 * Fast Checkout Variation Selector — frontend.
 *
 * Hydrates SSR-rendered <form> elements, listens to radio changes, resolves
 * to a variation ID once all attributes are picked, and swaps the cart
 * line via the WC Store API cart store.
 */

import { createRoot, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { resolveVariationId } from './resolve';
import type { VariationData } from './resolve';
import './view.scss';

const STORE = 'wc/store/cart' as const;

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

function VariationSelector( { host, productId, variations, currentVariationId }: RootProps ) {
	const [ pendingId, setPendingId ] = useState< number >( currentVariationId );
	const [ inFlight, setInFlight ] = useState( false );
	const [ error, setError ] = useState< string >( '' );
	// Track in-flight via ref so concurrent change events early-return without racing on state.
	const inFlightRef = useRef< boolean >( false );
	// Remember which radios were SSR-disabled (out of stock) so we don't re-enable them later.
	const ssrDisabled = useRef< Set< HTMLInputElement > | null >( null );

	const noticeNode = useMemo< HTMLElement | null >(
		() => host.querySelector( '.wp-block-newspack-blocks-fast-checkout-variation-selector__notice' ),
		[ host ]
	);

	// Capture SSR-disabled radios on mount so disabled-state toggling preserves them.
	useEffect( () => {
		if ( ssrDisabled.current === null ) {
			ssrDisabled.current = new Set();
			host.querySelectorAll< HTMLInputElement >( 'input[type="radio"][disabled]' ).forEach( input => {
				ssrDisabled.current!.add( input );
			} );
		}
	}, [ host ] );

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
			if ( inFlightRef.current ) {
				return;
			}
			setError( '' );
			const selection = readCurrentSelections( host );
			const resolvedId = resolveVariationId( variations, selection );
			if ( ! resolvedId ) {
				return;
			}
			// Verify the resolved variation is in stock before attempting cart swap.
			const resolved = variations.find( v => v.id === resolvedId );
			if ( resolved && ! resolved.is_in_stock ) {
				setError( __( 'That combination is out of stock.', 'newspack-blocks' ) );
				revertSelection( host, pendingId, variations );
				return;
			}
			if ( resolvedId === pendingId ) {
				return;
			}
			inFlightRef.current = true;
			setInFlight( true );
			try {
				await swapCartItem( pendingId, resolvedId, parseInt( host.dataset.sourcePost || '0', 10 ) );
				setPendingId( resolvedId );
				updateUrlParam( 'fc_variation', String( resolvedId ) );
			} catch ( e: unknown ) {
				setError( ( e as Error )?.message || __( 'Could not update selection.', 'newspack-blocks' ) );
				revertSelection( host, pendingId, variations );
			} finally {
				inFlightRef.current = false;
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
		host.dataset.status = inFlight ? 'busy' : 'idle';
		// Toggle the swapping flag on the parent Fast Checkout block so a CSS
		// overlay can mask the WC Checkout block during cart updates and hide
		// the brief "Your cart is currently empty" flash.
		const fastCheckout = host.closest< HTMLElement >( '.wp-block-newspack-blocks-fast-checkout' );
		if ( fastCheckout ) {
			if ( inFlight ) {
				fastCheckout.dataset.fcSwapping = 'true';
			} else {
				delete fastCheckout.dataset.fcSwapping;
			}
		}
		// Disable all non-SSR-disabled radios while in-flight; restore the original disabled state when idle.
		host.querySelectorAll< HTMLInputElement >( 'input[type="radio"]' ).forEach( input => {
			if ( ssrDisabled.current?.has( input ) ) {
				input.disabled = true;
				return;
			}
			input.disabled = inFlight;
		} );
	}, [ host, inFlight ] );

	return null;
}

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

async function swapCartItem( oldVariationId: number, newVariationId: number, sourcePost: number ) {
	const cartActions = dispatch( STORE );
	const cartSelectors = select( STORE );
	const items = cartSelectors.getCartData()?.items || [];
	// For variation cart items, item.id is the variation_id.
	const existing = items.find( ( item: { id?: number; key?: string } ) => item.id === oldVariationId );

	if ( existing ) {
		await ( cartActions as { removeItemFromCart: ( key: string ) => Promise< unknown > } ).removeItemFromCart(
			( existing as { key: string } ).key
		);
	}

	// The Store API accepts a variation ID directly as the cart item id; no need to spell out attributes.
	const cartItemData: Record< string, unknown > = {};
	if ( sourcePost ) {
		cartItemData._newspack_fast_checkout_source_post = sourcePost;
	}
	await (
		cartActions as {
			addItemToCart: ( id: number, qty: number, variation?: unknown[], cartItemData?: Record< string, unknown > ) => Promise< unknown >;
		}
	 ).addItemToCart( newVariationId, 1, [], cartItemData );
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
