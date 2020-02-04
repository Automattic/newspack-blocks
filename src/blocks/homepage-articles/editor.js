/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';
import { registerQueryStore, registerDeduplicatedBlock } from './store';

registerBlockType( `newspack-blocks/${ name }`, settings );
registerQueryStore();
registerDeduplicatedBlock( `newspack-blocks/${ name }` );
