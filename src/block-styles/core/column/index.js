/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { addFilter } from '@wordpress/hooks';

addFilter( 'blocks.registerBlockType', 'newspack-blocks', ( settings, name ) => {
	if ( name === 'core/column' ) {
		return {
			...settings,
			getEditWrapperProps: ( attributes ) => {
				const { width } = attributes;
				if ( Number.isFinite( width ) ) {
					return {
						style: {
							flexBasis: 'calc(' + width + '% - 16px)',
						},
					};
				}
			},
			save: ( { attributes } ) => {
				const { verticalAlignment, width } = attributes;
				const wrapperClasses = classnames( {
					[ `is-vertically-aligned-${ verticalAlignment }` ]: verticalAlignment,
				} );

				let style;
				if ( Number.isFinite( width ) ) {
					style = { flexBasis: 'calc(' + width + '% - 16px)' };
				}

				return (
					<div className={ wrapperClasses } style={ style }>
						<InnerBlocks.Content />
					</div>
				);
			},
		};
	}
	return settings;
} );
