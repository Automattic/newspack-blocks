import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useBlockProps } from '@wordpress/block-editor';
import { Spinner } from '@wordpress/components';

import type { StoreApiProduct, StoreApiVariation } from '../fast-checkout/types';

interface AttributeGroup {
	name: string;
	options: string[];
}

interface EditProps {
	context: {
		'newspack-blocks/fastCheckoutProductId'?: string | number;
	};
}

export default function Edit( { context }: EditProps ) {
	const productId = parseInt( String( context?.[ 'newspack-blocks/fastCheckoutProductId' ] ?? 0 ), 10 );
	const blockProps = useBlockProps( { 'data-editor-hint': __( 'Reader-facing variation selector', 'newspack-blocks' ) } );
	const [ groups, setGroups ] = useState< AttributeGroup[] | null >( null );

	useEffect( () => {
		if ( ! productId ) {
			setGroups( null );
			return;
		}
		apiFetch< StoreApiProduct >( { path: `/wc/store/v1/products/${ productId }` } )
			.then( product => {
				if ( ! product?.variations?.length ) {
					setGroups( [] );
					return;
				}
				return apiFetch< StoreApiVariation[] >( {
					path: `/wc/v2/products/${ productId }/variations?per_page=100`,
				} ).then( variations => {
					const map = new Map< string, Set< string > >();
					variations.forEach( v => {
						v.attributes.forEach( a => {
							if ( ! map.has( a.name ) ) {
								map.set( a.name, new Set() );
							}
							map.get( a.name )!.add( a.option );
						} );
					} );
					const next: AttributeGroup[] = [];
					map.forEach( ( opts, name ) => {
						next.push( { name, options: Array.from( opts ) } );
					} );
					setGroups( next );
				} );
			} )
			.catch( () => setGroups( [] ) );
	}, [ productId ] );

	if ( ! productId ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'Pick a product on the parent Fast Checkout block.', 'newspack-blocks' ) }</em>
			</div>
		);
	}

	if ( null === groups ) {
		return (
			<div { ...blockProps }>
				<Spinner />
			</div>
		);
	}

	if ( ! groups.length ) {
		return (
			<div { ...blockProps }>
				<em>{ __( 'No variations found for this product.', 'newspack-blocks' ) }</em>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			{ groups.map( group => (
				<fieldset key={ group.name }>
					<legend>{ group.name }</legend>
					{ group.options.map( option => {
						const inputId = `preview_${ group.name }_${ option }`;
						return (
							<label key={ option } htmlFor={ inputId }>
								<input id={ inputId } type="radio" name={ `preview_${ group.name }` } disabled />
								<span>{ option }</span>
							</label>
						);
					} ) }
				</fieldset>
			) ) }
		</div>
	);
}
