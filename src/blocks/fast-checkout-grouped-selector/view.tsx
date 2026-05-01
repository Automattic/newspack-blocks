/**
 * Fast Checkout Grouped Selector — frontend.
 *
 * Hydrates the SSR shell, listens for radio changes, and swaps the cart
 * line via the WC Store API cart store.
 */

import { createRoot, useEffect, useMemo, useState } from '@wordpress/element';
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

	const noticeNode = useMemo< HTMLElement | null >(
		() => host.querySelector( '.wp-block-newspack-blocks-fast-checkout-grouped-selector__notice' ),
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
		const onChange = async ( e: Event ) => {
			const target = e.target as HTMLInputElement;
			if ( target?.type !== 'radio' ) {
				return;
			}
			const nextId = parseInt( target.value, 10 );
			if ( ! nextId || nextId === pendingId ) {
				return;
			}
			setError( '' );
			setInFlight( true );
			try {
				await swapCartItem( pendingId, nextId );
				setPendingId( nextId );
				updateUrlParam( 'fc_grouped_child', String( nextId ) );
			} catch ( ex: unknown ) {
				setError( ( ex as Error )?.message || __( 'Could not update selection.', 'newspack-blocks' ) );
				const previous = host.querySelector< HTMLInputElement >( `input[type="radio"][value="${ pendingId }"]` );
				if ( previous ) {
					previous.checked = true;
				}
			} finally {
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
		host.querySelectorAll< HTMLInputElement >( 'input[type="radio"]' ).forEach( input => {
			if ( ! input.disabled ) {
				input.disabled = inFlight;
			}
		} );
	}, [ host, inFlight ] );

	return null;
}

async function swapCartItem( oldChildId: number, newChildId: number ) {
	const cartActions = dispatch( STORE );
	const cartSelectors = select( STORE );
	const items = cartSelectors.getCartData()?.items || [];
	const existing = items.find( ( item: { id?: number; key?: string } ) => item.id === oldChildId );
	if ( existing ) {
		await ( cartActions as { removeItemFromCart: ( key: string ) => Promise< unknown > } ).removeItemFromCart(
			( existing as { key: string } ).key
		);
	}
	await ( cartActions as { addItemToCart: ( id: number, qty: number ) => Promise< unknown > } ).addItemToCart( newChildId, 1 );
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
