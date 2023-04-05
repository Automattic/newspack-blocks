/* eslint-disable @wordpress/no-unsafe-wp-apis */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { debounce, invert } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
	__experimentalUseBorderProps as useBorderProps,
	__experimentalUseColorProps as useColorProps,
	__experimentalGetSpacingClassesAndStyles as useSpacingProps,
} from '@wordpress/block-editor';
import { PanelBody, BaseControl, FormTokenField, Button } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import './edit.scss';

function ProductField( props ) {
	const [ suggestions, setSuggestions ] = useState( {} );
	const [ selected, setSelected ] = useState( false );
	const [ isChanging, setIsChanging ] = useState( false );
	function fetchSuggestions( search ) {
		return apiFetch( {
			path: `/wc/v2/products?search=${ encodeURIComponent( search ) }`,
		} ).then( products => {
			const _suggestions = {};
			products.forEach( product => {
				_suggestions[ product.id ] = `${ product.id }: ${ product.name }`;
			} );
			setSuggestions( _suggestions );
		} );
	}
	function fetchSaved() {
		return apiFetch( {
			path: `/wc/v2/products/${ props.value }`,
		} ).then( product => {
			setSuggestions( { [ product.id ]: `${ product.id }: ${ product.name }` } );
			setSelected( product );
		} );
	}
	useEffect( () => {
		setIsChanging( false );
		if ( props.value ) {
			fetchSaved();
		} else {
			setSelected( false );
		}
	}, [ props.value ] );
	function onChange( tokens ) {
		const productName = tokens[ 0 ];
		const productId = invert( suggestions )[ productName ];
		props.onChange( productId );
	}
	const debouncedFetchProductSuggestions = debounce( fetchSuggestions, 200 );
	return (
		<div className="newspack-purchase-button__product-field">
			{ selected && ! isChanging ? (
				<BaseControl
					className="newspack-purchase-button__product-field__selected"
					help={ __( 'Click to change the selected product', 'newspack-blocks' ) }
				>
					<Button
						isSecondary
						onClick={ () => setIsChanging( true ) }
						aria-label={ __( 'Change the selected product', 'newspack-blocks' ) }
					>
						{ selected.name }
					</Button>
				</BaseControl>
			) : (
				<>
					<FormTokenField
						placeholder={
							props.placeholder || __( 'Type to search for a product…', 'newspack-blocks' )
						}
						label={ __( 'Select a product', 'newspack-blocks' ) }
						maxLength={ 1 }
						onChange={ onChange }
						onInputChange={ input => debouncedFetchProductSuggestions( input ) }
						suggestions={ Object.values( suggestions ) }
					/>
					{ selected && (
						<Button isSecondary onClick={ () => setIsChanging( false ) }>
							{ __( 'Cancel', 'newspack-blocks' ) }
						</Button>
					) }
				</>
			) }
		</div>
	);
}

function PurchaseButtonEdit( props ) {
	const { attributes, setAttributes, className } = props;
	const { placeholder, style, text, product } = attributes;

	function setButtonText( newText ) {
		// Remove anchor tags from button text content.
		setAttributes( { text: newText.replace( /<\/?a[^>]*>/g, '' ) } );
	}

	const borderProps = useBorderProps( attributes );
	const colorProps = useColorProps( attributes );
	const spacingProps = useSpacingProps( attributes );
	const blockProps = useBlockProps();

	return (
		<>
			<div
				{ ...blockProps }
				className={ classnames( blockProps.className, {
					[ `has-custom-font-size` ]: blockProps.style.fontSize,
				} ) }
			>
				<RichText
					aria-label={ __( 'Button text' ) }
					placeholder={ placeholder || __( 'Add text…' ) }
					value={ text }
					onChange={ value => setButtonText( value ) }
					withoutInteractiveFormatting
					className={ classnames(
						className,
						'wp-block-button__link',
						colorProps.className,
						borderProps.className,
						{
							// For backwards compatibility add style that isn't
							// provided via block support.
							'no-border-radius': style?.border?.radius === 0,
						}
					) }
					style={ {
						...borderProps.style,
						...colorProps.style,
						...spacingProps.style,
					} }
					identifier="text"
				/>
			</div>
			<InspectorControls>
				<PanelBody title={ __( 'Product', 'newspack-blocks' ) }>
					<ProductField
						value={ product }
						onChange={ value => setAttributes( { product: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}

export default PurchaseButtonEdit;
