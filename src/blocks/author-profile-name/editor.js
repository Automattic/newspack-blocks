/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { name, settings } from '.';

// Note: name already includes 'newspack-blocks/' prefix from block.json
registerBlockType( name, settings );
