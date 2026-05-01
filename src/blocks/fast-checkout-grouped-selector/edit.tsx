import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

import type { StoreApiProduct } from '../fast-checkout/types';

interface Child {
	id: number;
	name: string;
	priceHtml: string;
}

interface EditProps {
	context: {
		'newspack-blocks/fastCheckoutProductId'?: string | number;
	};
}

export default function Edit( { context }: EditProps ) {
	const productId = parseInt( String( context?.[ 'newspack-blocks/fastCheckoutProductId' ] ?? 0 ), 10 );
	const blockProps = useBlockProps();
	const [ children, setChildren ] = useState< Child[] | null >( null );

	useEffect( () => {
		if ( ! productId ) {
			setChildren( null );
			return;
		}
		apiFetch< StoreApiProduct >( { path: `/wc/store/v1/products/${ productId }` } )
			.then( product => {
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
								name: c.name,
								priceHtml: c.price_html,
							} ) )
					);
				} );
			} )
			.catch( () => setChildren( [] ) );
	}, [ productId ] );

	if ( ! productId ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'Pick a grouped product on the parent Fast Checkout block.', 'newspack-blocks' ) }</em>
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

	const visible = children.slice( 0, 5 );
	const overflow = children.length - visible.length;

	return (
		<div { ...blockProps }>
			{ visible.map( child => {
				const id = `preview-grouped-${ child.id }`;
				return (
					<label key={ child.id } htmlFor={ id }>
						<input id={ id } type="radio" name="preview_grouped" disabled />
						<span>{ child.name }</span>
						<span className="price" dangerouslySetInnerHTML={ { __html: child.priceHtml } } />
					</label>
				);
			} ) }
			{ overflow > 0 && (
				<em>
					{
						/* translators: %d is the count of additional grouped children. */
						__( '+%d more', 'newspack-blocks' ).replace( '%d', String( overflow ) )
					}
				</em>
			) }
		</div>
	);
}
