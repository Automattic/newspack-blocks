import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

import type { StoreApiProduct } from '../fast-checkout/types';

interface ChildPreview {
	id: number;
	name: string;
}

interface EditProps {
	context: {
		'newspack-blocks/fastCheckoutProductId'?: string | number;
	};
}

export default function Edit( { context }: EditProps ) {
	const productId = parseInt( String( context?.[ 'newspack-blocks/fastCheckoutProductId' ] ?? 0 ), 10 );
	const blockProps = useBlockProps();
	const [ children, setChildren ] = useState< ChildPreview[] | null >( null );

	useEffect( () => {
		if ( ! productId ) {
			setChildren( null );
			return;
		}
		apiFetch< StoreApiProduct >( { path: `/wc/store/v1/products/${ productId }` } )
			.then( product => {
				const parentPrefix = `${ product?.name || '' }: `;
				const ids = product?.grouped_products || [];
				if ( ! ids.length ) {
					setChildren( [] );
					return;
				}
				return Promise.all(
					ids.map( id => apiFetch< StoreApiProduct >( { path: `/wc/store/v1/products/${ id }` } ).catch( () => null ) )
				).then( fetched => {
					setChildren(
						fetched
							.filter( ( c ): c is StoreApiProduct => Boolean( c ) )
							.map( c => ( {
								id: c.id,
								name: c.name.startsWith( parentPrefix ) ? c.name.slice( parentPrefix.length ) : c.name,
							} ) )
					);
				} );
			} )
			.catch( () => setChildren( [] ) );
	}, [ productId ] );

	if ( ! productId ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'Pick a grouped Donate product on the parent Fast Checkout block.', 'newspack-blocks' ) }</em>
			</div>
		);
	}

	if ( null === children ) {
		return (
			<div { ...blockProps }>
				<Spinner />
			</div>
		);
	}

	if ( ! children.length ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'No grouped children found for this product.', 'newspack-blocks' ) }</em>
			</div>
		);
	}

	const inputId = 'fc-donate-edit-amount';

	return (
		<div { ...blockProps }>
			<div className="wp-block-newspack-blocks-fast-checkout-donate-selector__frequencies">
				{ children.map( child => {
					const id = `preview-donate-${ child.id }`;
					return (
						<label key={ child.id } htmlFor={ id }>
							<input id={ id } type="radio" name="preview_donate" disabled />
							<span>{ child.name }</span>
						</label>
					);
				} ) }
			</div>
			<div className="wp-block-newspack-blocks-fast-checkout-donate-selector__amount">
				<label htmlFor={ inputId }>{ __( 'Set your price', 'newspack-blocks' ) }</label>
				<div className="wp-block-newspack-blocks-fast-checkout-donate-selector__input-wrapper">
					<input id={ inputId } type="number" disabled />
					<span className="wp-block-newspack-blocks-fast-checkout-donate-selector__suffix" />
				</div>
			</div>
		</div>
	);
}
