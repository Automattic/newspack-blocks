/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { settings, name } from '.';
import { registerQueryStore } from './store';

const BLOCK_NAME = `newspack-blocks/${ name }`;

registerBlockType( BLOCK_NAME, settings );
registerQueryStore( BLOCK_NAME );
