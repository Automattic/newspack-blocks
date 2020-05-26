/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { BLOCK_NAME, settings } from '.';
import registerHomepagePostsBlockStore from './store';

registerBlockType( BLOCK_NAME, settings );
registerHomepagePostsBlockStore();
