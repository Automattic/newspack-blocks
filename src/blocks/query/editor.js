/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { name, settings } from '.';
registerBlockType( `newspack-blocks/${ name }`, settings );

import { registerTitleBlock } from './post-blocks/title';
import { registerAuthorBlock } from './post-blocks/author';
import { registerDateBlock } from './post-blocks/date';
import { registerExcerptBlock } from './post-blocks/excerpt';
import { registerFeaturedImageBlock } from './post-blocks/featured-image';
import { registerPostContentBlock } from './post-blocks/post-content';
import { registerPostCategoriesBlock } from './post-blocks/categories';
import { registerPostTagsBlock } from './post-blocks/tags';

registerTitleBlock();
registerExcerptBlock();
registerAuthorBlock();
registerDateBlock();
registerFeaturedImageBlock();
registerPostContentBlock();
registerPostCategoriesBlock();
registerPostTagsBlock();
