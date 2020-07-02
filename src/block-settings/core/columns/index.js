/**
 * External Dependencies
 */
import classnames from 'classnames';

/**
 * WordPress Dependencies
 */
const { __ } = wp.i18n;
const { addFilter } = wp.hooks;
const { Fragment } = wp.element;
const { InspectorAdvancedControls } = wp.editor;
const { createHigherOrderComponent } = wp.compose;
const { ToggleControl } = wp.components;

//restrict to specific block names
const allowedBlocks = [ 'core/columns' ];

/**
 * Add custom attribute for mobile visibility.
 *
 * @param {Object} settings Settings for the block.
 *
 * @return {Object} settings Modified settings.
 */
function addAttributes( settings ) {
	// check if object exists for old Gutenberg version compatibility
	// add allowedBlocks restriction
	if ( typeof settings.attributes !== 'undefined' && allowedBlocks.includes( settings.name ) ) {
		settings.attributes = Object.assign( settings.attributes, {
			stackedForTablets: {
				type: 'boolean',
				default: false,
			},
		} );
	}

	return settings;
}

/**
 * Add mobile visibility controls on Advanced Block Panel.
 *
 * @param {function} BlockEdit Block edit component.
 *
 * @return {function} BlockEdit Modified block edit component.
 */
const withAdvancedControls = createHigherOrderComponent( BlockEdit => {
	return props => {
		const { name, attributes, setAttributes, isSelected } = props;

		const { stackedForTablets } = attributes;

		return (
			<Fragment>
				<BlockEdit { ...props } />
				{ isSelected && allowedBlocks.includes( name ) && (
					<InspectorAdvancedControls>
						<ToggleControl
							label={ __( 'Stack columns on tablet-sized screens' ) }
							checked={ !! stackedForTablets }
							onChange={ () => setAttributes( { stackedForTablets: ! stackedForTablets } ) }
							help={
								!! stackedForTablets
									? __( 'Block displays in one-column on tablets.' )
									: __( 'Block displays in evenly-spaced columns on tablets.' )
							}
						/>
					</InspectorAdvancedControls>
				) }
			</Fragment>
		);
	};
}, 'withAdvancedControls' );

/**
 * Add custom element class in save element.
 *
 * @param {Object} extraProps     Block element.
 * @param {Object} blockType      Blocks object.
 * @param {Object} attributes     Blocks attributes.
 *
 * @return {Object} extraProps Modified block element.
 */
function applyExtraClass( extraProps, blockType, attributes ) {
	const { stackedForTablets } = attributes;

	// check if attribute exists for old Gutenberg version compatibility
	// add class only when stackedForTablets = true
	// add allowedBlocks restriction
	if ( stackedForTablets && allowedBlocks.includes( blockType.name ) ) {
		extraProps.className = classnames( extraProps.className, 'stack-col' );
	}

	return extraProps;
}

//add filters

addFilter( 'blocks.registerBlockType', 'editorskit/custom-attributes', addAttributes );

addFilter( 'editor.BlockEdit', 'editorskit/custom-advanced-control', withAdvancedControls );

addFilter( 'blocks.getSaveContent.extraProps', 'editorskit/applyExtraClass', applyExtraClass );
