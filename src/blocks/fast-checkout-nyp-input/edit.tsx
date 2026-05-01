import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

import type { StoreApiProduct } from '../fast-checkout/types';

interface EditProps {
	context: {
		'newspack-blocks/fastCheckoutProductId'?: string | number;
		'newspack-blocks/fastCheckoutNypPrice'?: string;
	};
}

type NypState = { status: 'loading' } | { status: 'not-nyp' } | { status: 'ready'; min?: string; max?: string; suggested?: string };

export default function Edit( { context }: EditProps ) {
	const productId = parseInt( String( context?.[ 'newspack-blocks/fastCheckoutProductId' ] ?? 0 ), 10 );
	const overridePrice = String( context?.[ 'newspack-blocks/fastCheckoutNypPrice' ] || '' );
	const blockProps = useBlockProps();
	const [ nyp, setNyp ] = useState< NypState >( { status: 'loading' } );

	useEffect( () => {
		if ( ! productId ) {
			setNyp( { status: 'loading' } );
			return;
		}
		setNyp( { status: 'loading' } );
		apiFetch< StoreApiProduct >( { path: `/wc/store/v1/products/${ productId }` } )
			.then( product => {
				const ext = product?.extensions?.name_your_price;
				if ( ! ext?.is_nyp ) {
					setNyp( { status: 'not-nyp' } );
					return;
				}
				setNyp( {
					status: 'ready',
					min: ext.minimum_price,
					max: ext.maximum_price,
					suggested: ext.suggested_price,
				} );
			} )
			.catch( () => setNyp( { status: 'not-nyp' } ) );
	}, [ productId ] );

	if ( ! productId ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'Pick a Name Your Price product on the parent Fast Checkout block.', 'newspack-blocks' ) }</em>
			</div>
		);
	}

	if ( nyp.status === 'loading' ) {
		return (
			<div { ...blockProps }>
				<Spinner />
			</div>
		);
	}

	if ( nyp.status === 'not-nyp' ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'This product is not configured for Name Your Price.', 'newspack-blocks' ) }</em>
			</div>
		);
	}

	const inputId = 'fc-nyp-edit-input';

	return (
		<div { ...blockProps }>
			<label htmlFor={ inputId }>{ __( 'Set your price', 'newspack-blocks' ) }</label>
			<input id={ inputId } type="number" disabled placeholder={ overridePrice || nyp.suggested } />
			<p className="wp-block-newspack-blocks-fast-checkout-nyp-input__hint">
				{ nyp.min && nyp.max
					? `${ nyp.min } – ${ nyp.max } · suggested ${ nyp.suggested }`
					: __( 'Reader can set any amount.', 'newspack-blocks' ) }
			</p>
		</div>
	);
}
