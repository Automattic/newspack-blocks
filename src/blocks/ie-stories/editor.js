/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { settings, name } from '.';
import { registerQueryStore } from '../homepage-articles/utils';

const BLOCK_NAME = `newspack-blocks/${ name }`;

registerBlockType( BLOCK_NAME, settings );
registerQueryStore( BLOCK_NAME );

// Unregister homepage-articles as we have extend the funcanility in ie-stories block
wp.blocks.unregisterBlockType( 'newspack-blocks/homepage-articles' );
