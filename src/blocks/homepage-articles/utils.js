/**
 * External dependencies
 */
import { debounce, isEqual, isUndefined, pick, pickBy } from 'lodash';

/**
 * External dependencies
 */
import { select as globalSelect } from '@wordpress/data';

import { STORE_NAMESPACE } from './store';

/**
 * Based global WP.com blog_public option, checks whether current blog is
 * private or not.
 *
 * @return {boolean} a private WP.com blog flag
 */
export const isBlogPrivate = () =>
	typeof window === 'object' &&
	window.wpcomGutenberg &&
	Number( window.wpcomGutenberg.blogPublic ) === -1;

/**
 * Block attributes which influence posts query
 */
const POST_QUERY_ATTRIBUTES = [
	'postsToShow',
	'authors',
	'categories',
	'excerptLength',
	'tags',
	'showExcerpt',
	'specificPosts',
	'specificMode',
	'tagExclusions',
	'postType',
];

/**
 * Does the props change necessitate a reflow?
 * A reflow should happen if:
 * 1. Query-changing attributes of a block change
 * 2. The top-level blocks order changes. A Homepage Articles
 *    block might be nested somewhere.
 *
 * @param {Object} prevProps Edit component props
 * @param {Object} props Edit component props
 */
export const shouldReflow = ( prevProps, props ) =>
	! isEqual(
		pick( prevProps.attributes, POST_QUERY_ATTRIBUTES ),
		pick( props.attributes, POST_QUERY_ATTRIBUTES )
	) || ! isEqual( prevProps.topBlocksClientIdsInOrder, props.topBlocksClientIdsInOrder );

/**
 * Builds query criteria from given attributes.
 *
 * @param {Object} attributes block attributes
 * @return {Object} criteria
 */
export const queryCriteriaFromAttributes = attributes => {
	const {
		postsToShow,
		authors,
		categories,
		excerptLength,
		postType,
		showExcerpt,
		tags,
		specificPosts = [],
		specificMode,
		tagExclusions,
	} = pick( attributes, POST_QUERY_ATTRIBUTES );

	const cleanPosts = sanitizePostList( specificPosts );
	const isSpecificPostModeActive = specificMode && cleanPosts && cleanPosts.length;
	const criteria = pickBy(
		isSpecificPostModeActive
			? {
					include: cleanPosts,
					per_page: specificPosts.length,
					post_type: postType,
			  }
			: {
					per_page: postsToShow,
					categories,
					author: authors,
					tags,
					tags_exclude: tagExclusions,
					post_type: postType,
			  },
		value => ! isUndefined( value )
	);
	criteria.suppress_password_protected_posts = true;
	criteria.excerpt_length = excerptLength;
	criteria.show_excerpt = showExcerpt;
	return criteria;
};

export const sanitizePostList = postList =>
	postList.map( id => parseInt( id ) ).filter( id => id > 0 );

export const getBlockQueries = ( blocks, blockNames ) =>
	blocks.flatMap( block => {
		const homepageArticleBlocks = [];
		if ( blockNames.indexOf( block.name ) >= 0 ) {
			const postsQuery = queryCriteriaFromAttributes( block.attributes );
			homepageArticleBlocks.push( { postsQuery, clientId: block.clientId } );
		}
		return homepageArticleBlocks.concat( getBlockQueries( block.innerBlocks, blockNames ) );
	} );

export const getEditorBlocksIds = blocks =>
	blocks.flatMap( block => {
		const homepageArticleBlocks = [];
		homepageArticleBlocks.push( block.clientId );
		return homepageArticleBlocks.concat( getEditorBlocksIds( block.innerBlocks ) );
	} );

const getCoreStorePosts = debounce(
	attributes =>
		globalSelect( 'core' ).getEntityRecords(
			'postType',
			'post',
			queryCriteriaFromAttributes( attributes )
		),
	500
);

export const postsBlockSelector = ( select, { clientId, attributes } ) => {
	const { getPostTypes } = select( 'core' );
	const { getEditorBlocks, getBlocks } = select( 'core/editor' );
	const editorBlocksIds = getEditorBlocksIds( getEditorBlocks() );
	// The block might be rendered in the block styles preview, not in the editor.
	const isEditorBlock = editorBlocksIds.indexOf( clientId ) >= 0;

	const { getPosts, getError, isUIDisabled } = select( STORE_NAMESPACE );
	const props = {
		isEditorBlock,
		isUIDisabled: isUIDisabled(),
		error: getError( { clientId } ),
		topBlocksClientIdsInOrder: getBlocks().map( block => block.clientId ),
		availablePostTypes: getPostTypes( { per_page: -1 } )?.filter(
			( { supports: { newspack_blocks: newspackBlocks } } ) => newspackBlocks
		),
	};

	if ( isEditorBlock ) {
		props.latestPosts = getPosts( { clientId } );
	} else {
		// For block preview, display without deduplication. If there would be a way to match the outside-editor's
		// block clientId to the clientId of the block that's being previewed, the correct posts could be shown here.
		props.latestPosts = getCoreStorePosts( attributes );
	}

	return props;
};

export const postsBlockDispatch = ( dispatch, { isEditorBlock } ) => {
	return {
		// Only editor blocks can trigger reflows.
		triggerReflow: isEditorBlock ? dispatch( STORE_NAMESPACE ).reflow : () => {},
	};
};
