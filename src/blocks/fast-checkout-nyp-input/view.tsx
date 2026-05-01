/**
 * Fast Checkout NYP Input — frontend.
 *
 * Hydrates the SSR input element. On blur (debounced 300 ms) clamps the
 * value and dispatches a cart update via the WC Store API cart store.
 */

import { createRoot, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { dispatch, select } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import './view.scss';

const STORE = 'wc/store/cart' as const;
const DEBOUNCE_MS = 300;

interface RootProps {
	host: HTMLElement;
	productId: number;
	min: number;
	max: number;
}

function NypInput( { host, productId, min, max }: RootProps ) {
	const input = useMemo< HTMLInputElement | null >( () => host.querySelector< HTMLInputElement >( 'input[type="number"]' ), [ host ] );
	const noticeNode = useMemo< HTMLElement | null >(
		() => host.querySelector( '.wp-block-newspack-blocks-fast-checkout-nyp-input__notice' ),
		[ host ]
	);
	const [ inFlight, setInFlight ] = useState( false );
	const [ error, setError ] = useState< string >( '' );
	const lastApplied = useRef< number >( parseFloat( input?.value || '0' ) || 0 );
	const timer = useRef< ReturnType< typeof setTimeout > | null >( null );

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
		host.dataset.status = inFlight ? 'busy' : 'idle';
	}, [ host, inFlight ] );

	useEffect( () => {
		if ( ! input ) {
			return;
		}
		const onBlur = () => {
			if ( timer.current ) {
				clearTimeout( timer.current );
			}
			timer.current = setTimeout( apply, DEBOUNCE_MS );
		};

		const apply = async () => {
			const raw = parseFloat( input.value );
			if ( ! isFinite( raw ) || raw <= 0 ) {
				setError( __( 'Enter a valid amount.', 'newspack-blocks' ) );
				input.value = String( lastApplied.current );
				return;
			}
			let clamped = raw;
			if ( max > 0 ) {
				clamped = Math.min( clamped, max );
			}
			if ( min > 0 ) {
				clamped = Math.max( clamped, min );
			}
			if ( clamped !== raw ) {
				input.value = String( clamped );
				setError(
					sprintf(
						/* translators: %s is the price actually applied. */
						__( 'Adjusted to %s to meet limits.', 'newspack-blocks' ),
						String( clamped )
					)
				);
			} else {
				setError( '' );
			}
			if ( clamped === lastApplied.current ) {
				return;
			}

			setInFlight( true );
			try {
				await applyNypPrice( productId, clamped );
				lastApplied.current = clamped;
				updateUrlParam( 'fc_price', String( clamped ) );
			} catch ( ex: unknown ) {
				setError( ( ex as Error )?.message || __( 'Could not update price.', 'newspack-blocks' ) );
				input.value = String( lastApplied.current );
			} finally {
				setInFlight( false );
			}
		};

		input.addEventListener( 'blur', onBlur );
		return () => {
			input.removeEventListener( 'blur', onBlur );
			if ( timer.current ) {
				clearTimeout( timer.current );
			}
		};
	}, [ input, min, max, productId ] );

	useEffect( () => {
		const onPopstate = () => {
			const params = new URLSearchParams( window.location.search );
			const next = parseFloat( params.get( 'fc_price' ) || '' );
			if ( isFinite( next ) && next > 0 && input && next !== lastApplied.current ) {
				input.value = String( next );
				lastApplied.current = next;
			}
		};
		window.addEventListener( 'popstate', onPopstate );
		return () => window.removeEventListener( 'popstate', onPopstate );
	}, [ input ] );

	return null;
}

async function applyNypPrice( productId: number, price: number ) {
	const cartActions = dispatch( STORE );
	const cartSelectors = select( STORE );
	const items = cartSelectors.getCartData()?.items || [];
	const existing = items.find( ( item: { id?: number; key?: string } ) => item.id === productId ) as { key?: string } | undefined;

	if ( existing?.key ) {
		await ( cartActions as { removeItemFromCart: ( key: string ) => Promise< unknown > } ).removeItemFromCart( existing.key );
	}
	await (
		cartActions as {
			addItemToCart: ( id: number, qty: number, variation?: unknown[], cartItemData?: Record< string, unknown > ) => Promise< unknown >;
		}
	 ).addItemToCart( productId, 1, [], { nyp: price } );
}

function updateUrlParam( key: string, value: string ) {
	const url = new URL( window.location.href );
	url.searchParams.set( key, value );
	window.history.replaceState( {}, '', url.toString() );
}

function init() {
	document.querySelectorAll< HTMLElement >( '.wp-block-newspack-blocks-fast-checkout-nyp-input' ).forEach( host => {
		const productId = parseInt( host.dataset.productId || '0', 10 );
		const min = parseFloat( host.dataset.min || '0' ) || 0;
		const max = parseFloat( host.dataset.max || '0' ) || 0;
		if ( ! productId ) {
			return;
		}
		const sentinel = document.createElement( 'span' );
		sentinel.style.display = 'none';
		host.appendChild( sentinel );
		const root = createRoot( sentinel );
		root.render( <NypInput host={ host } productId={ productId } min={ min } max={ max } /> );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
