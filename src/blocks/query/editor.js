/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';
registerBlockType( `newspack-blocks/${ name }`, settings );

import { registerQueryStore, registerDeduplicatedBlock } from '../homepage-articles/store';
registerQueryStore();
registerDeduplicatedBlock( `newspack-blocks/${ name }` );

import { registerAuthorBlock } from './field-blocks/author';
import { registerCategoriesBlock } from './field-blocks/categories';
import { registerTitleBlock } from './field-blocks/title';
import { registerDateBlock } from './field-blocks/date';
import { registerExcerptBlock } from './field-blocks/excerpt';
import { registerFeaturedImageBlock } from './field-blocks/featured-image';
import { registerTagsBlock } from './field-blocks/tags';

registerAuthorBlock();
registerCategoriesBlock();
registerTitleBlock();
registerExcerptBlock();
registerDateBlock();
registerFeaturedImageBlock();
registerTagsBlock();
