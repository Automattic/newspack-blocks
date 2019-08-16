/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';
console.log("HI")
registerBlockType( `newspack-blocks/${ name }`, settings );
