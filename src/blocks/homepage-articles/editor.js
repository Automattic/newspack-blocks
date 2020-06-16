/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { BLOCK_NAME, settings } from '.';
import { registerQueryStore } from './store';

registerBlockType( BLOCK_NAME, settings );
registerQueryStore();
