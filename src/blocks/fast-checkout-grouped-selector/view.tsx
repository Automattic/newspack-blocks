/**
 * Fast Checkout Grouped Selector — frontend.
 *
 * Hydrates the SSR shell, listens for radio changes, and swaps the cart
 * line via the WC Store API cart store.
 */

import { createRoot, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import './view.scss';

const STORE = 'wc/store/cart' as const;

interface RootProps {
	host: HTMLFormElement;
	currentChildId: number;
}

function GroupedSelector( { host, currentChildId }: RootProps ) {
	const [ pendingId, setPendingId ] = useState< number >( currentChildId );
	const [ inFlight, setInFlight ] = useState( false );
	const [ error, setError ] = useState< string >( '' );
	const inFlightRef = useRef< boolean >( false );
	// Remember which radios were SSR-disabled (out of stock / unpurchasable).
	const ssrDisabled = useRef< Set< HTMLInputElement > | null >( null );

	const noticeNode = useMemo< HTMLElement | null >(
		() => host.querySelector( '.wp-block-newspack-blocks-fast-checkout-grouped-selector__notice' ),
		[ host ]
	);

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
		const onChange = async ( e: Event ) => {
			if ( inFlightRef.current ) {
				return;
			}
			const target = e.target as HTMLInputElement;
			if ( target?.type !== 'radio' ) {
				return;
			}
			const nextId = parseInt( target.value, 10 );
			if ( ! nextId || nextId === pendingId ) {
				return;
			}
			setError( '' );
			inFlightRef.current = true;
			setInFlight( true );
			try {
				await swapCartItem( pendingId, nextId, parseInt( host.dataset.sourcePost || '0', 10 ) );
				setPendingId( nextId );
				updateUrlParam( 'fc_grouped_child', String( nextId ) );
			} catch ( ex: unknown ) {
				setError( ( ex as Error )?.message || __( 'Could not update selection.', 'newspack-blocks' ) );
				const previous = host.querySelector< HTMLInputElement >( `input[type="radio"][value="${ pendingId }"]` );
				if ( previous ) {
					previous.checked = true;
				}
			} finally {
				inFlightRef.current = false;
				setInFlight( false );
			}
		};
		host.addEventListener( 'change', onChange );
		return () => host.removeEventListener( 'change', onChange );
	}, [ host, pendingId ] );

	useEffect( () => {
		const onPopstate = () => {
			const params = new URLSearchParams( window.location.search );
			const next = parseInt( params.get( 'fc_grouped_child' ) || '', 10 );
			if ( next && next !== pendingId ) {
				const radio = host.querySelector< HTMLInputElement >( `input[type="radio"][value="${ next }"]` );
				if ( radio ) {
					radio.checked = true;
					setPendingId( next );
				}
			}
		};
		window.addEventListener( 'popstate', onPopstate );
		return () => window.removeEventListener( 'popstate', onPopstate );
	}, [ host, pendingId ] );

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

async function swapCartItem( oldChildId: number, newChildId: number, sourcePost: number ) {
	const cartActions = dispatch( STORE );
	const cartSelectors = select( STORE );
	const items = cartSelectors.getCartData()?.items || [];
	const existing = items.find( ( item: { id?: number; key?: string } ) => item.id === oldChildId );
	if ( existing ) {
		await ( cartActions as { removeItemFromCart: ( key: string ) => Promise< unknown > } ).removeItemFromCart(
			( existing as { key: string } ).key
		);
	}
	const cartItemData: Record< string, unknown > = {};
	if ( sourcePost ) {
		cartItemData._newspack_fast_checkout_source_post = sourcePost;
	}
	await (
		cartActions as {
			addItemToCart: ( id: number, qty: number, variation?: unknown[], cartItemData?: Record< string, unknown > ) => Promise< unknown >;
		}
	 ).addItemToCart( newChildId, 1, [], cartItemData );
}

function updateUrlParam( key: string, value: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( key, value );
	window.history.replaceState( {}, '', url.toString() );
}

function init() {
	document.querySelectorAll< HTMLFormElement >( '.wp-block-newspack-blocks-fast-checkout-grouped-selector' ).forEach( host => {
		const currentChildId = parseInt( host.dataset.currentChild || '0', 10 );
		if ( ! currentChildId ) {
			return;
		}
		const sentinel = document.createElement( 'span' );
		sentinel.style.display = 'none';
		host.appendChild( sentinel );
		const root = createRoot( sentinel );
		root.render( <GroupedSelector host={ host } currentChildId={ currentChildId } /> );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
