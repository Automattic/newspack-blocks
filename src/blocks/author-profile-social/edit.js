/**
 * WordPress dependencies
 */
import { useContext, useEffect, useRef } from '@wordpress/element';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AuthorContext } from '../author-profile/context';

const ALLOWED_BLOCKS = [ 'newspack-blocks/author-social-link' ];

/**
 * Get the list of available services from author data.
 *
 * @param {Object} author Author data.
 * @return {Array} Array of service key strings.
 */
function getAvailableServices( author ) {
	const services = [];

	if ( author?.social ) {
		Object.entries( author.social ).forEach( ( [ service, data ] ) => {
			if ( data?.url ) {
				services.push( service );
			}
		} );
	}

	if ( author?.email ) {
		services.push( 'email' );
	}

	if ( author?.newspack_phone_number ) {
		services.push( 'phone' );
	}

	return services;
}

/**
 * Build InnerBlocks template from available services.
 *
 * @param {Array} services List of service keys.
 * @return {Array} Block template array.
 */
function buildTemplate( services ) {
	return services.map( service => [ 'newspack-blocks/author-social-link', { service } ] );
}

/**
 * Edit component for the Author Social Links inner block.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Function to update attributes.
 * @param {string}   props.clientId      Block client ID.
 * @return {JSX.Element} The edit component.
 */
export default function Edit( { attributes, setAttributes, clientId } ) {
	const author = useContext( AuthorContext );
	const { iconSize } = attributes;
	const hasPopulated = useRef( false );

	const blockProps = useBlockProps( {
		className: 'wp-block-newspack-blocks-author-profile-social',
		style: {
			'--icon-size': `${ iconSize }px`,
		},
	} );

	// Pass iconSize to author context for child blocks to read.
	// We use a mutable property on the author object as a simple way to pass it down.
	if ( author ) {
		author._iconSize = iconSize;
	}

	// Check current inner blocks.
	const { innerBlockCount, currentServices } = useSelect(
		select => {
			const editor = select( 'core/block-editor' );
			const innerBlocks = editor.getBlocks( clientId );
			return {
				innerBlockCount: innerBlocks.length,
				currentServices: innerBlocks.map( b => b.attributes.service ).filter( Boolean ),
			};
		},
		[ clientId ]
	);

	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );

	// Auto-populate inner blocks from author data on first render (when no saved inner blocks).
	useEffect( () => {
		if ( hasPopulated.current || innerBlockCount > 0 ) {
			return;
		}

		const services = getAvailableServices( author );
		if ( services.length === 0 ) {
			return;
		}

		hasPopulated.current = true;

		const { createBlock } = wp.blocks;
		const blocks = services.map( service => createBlock( 'newspack-blocks/author-social-link', { service } ) );
		replaceInnerBlocks( clientId, blocks, false );
	}, [ author, innerBlockCount, clientId, replaceInnerBlocks ] );

	const services = getAvailableServices( author );
	const missingServices = services.filter( s => ! currentServices.includes( s ) );

	const resetLinks = () => {
		const { createBlock } = wp.blocks;
		const blocks = services.map( service => createBlock( 'newspack-blocks/author-social-link', { service } ) );
		replaceInnerBlocks( clientId, blocks, false );
	};

	const addMissingLinks = () => {
		const { createBlock } = wp.blocks;
		const newBlocks = missingServices.map( service => createBlock( 'newspack-blocks/author-social-link', { service } ) );
		const editor = wp.data.select( 'core/block-editor' );
		const existingBlocks = editor.getBlocks( clientId );
		replaceInnerBlocks( clientId, [ ...existingBlocks, ...newBlocks ], false );
	};

	if ( services.length === 0 && innerBlockCount === 0 ) {
		return (
			<div { ...blockProps }>
				<p className="social-links-placeholder">{ __( 'Social links will appear here.', 'newspack-blocks' ) }</p>
			</div>
		);
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Social Links Settings', 'newspack-blocks' ) }>
					<RangeControl
						label={ __( 'Icon Size', 'newspack-blocks' ) }
						value={ iconSize }
						onChange={ value => setAttributes( { iconSize: value } ) }
						min={ 16 }
						max={ 48 }
					/>
					{ missingServices.length > 0 && (
						<Button variant="secondary" onClick={ addMissingLinks } style={ { marginBottom: '8px' } }>
							{ __( 'Add missing links', 'newspack-blocks' ) }
						</Button>
					) }
					<Button variant="tertiary" onClick={ resetLinks } isDestructive>
						{ __( 'Reset to all author links', 'newspack-blocks' ) }
					</Button>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<ul className="author-profile-social__list">
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ buildTemplate( services ) }
						orientation="horizontal"
						renderAppender={ false }
					/>
				</ul>
			</div>
		</>
	);
}
