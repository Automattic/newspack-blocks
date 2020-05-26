/**
 * External dependencies
 */
import { isEqual, isUndefined, pick, pickBy } from 'lodash';

/**
 * Internal dependencies
 */
import { BLOCK_NAME } from '.';

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
	'tags',
	'specificPosts',
	'specificMode',
	'tagExclusions',
];

/**
 * Does the attributes change necessitate a reflow?
 *
 * @param {Object} prevAttributes block attributes
 * @param {Object} attributes block attributes
 */
export const shouldReflow = ( prevAttributes, attributes ) =>
	! isEqual(
		pick( prevAttributes, POST_QUERY_ATTRIBUTES ),
		pick( attributes, POST_QUERY_ATTRIBUTES )
	);

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
		tags,
		specificPosts,
		specificMode,
		tagExclusions,
	} = pick( attributes, POST_QUERY_ATTRIBUTES );

	const isSpecificPostModeActive = specificMode && specificPosts && specificPosts.length;

	const criteria = pickBy(
		isSpecificPostModeActive
			? {
					include: specificPosts,
					orderby: 'include',
					per_page: specificPosts.length,
			  }
			: {
					per_page: postsToShow,
					categories,
					author: authors,
					tags,
					tags_exclude: tagExclusions,
			  },
		value => ! isUndefined( value )
	);
	return criteria;
};

export const getBlockQueries = blocks =>
	blocks.flatMap( block => {
		const homepageArticleBlocks = [];
		if ( block.name === BLOCK_NAME ) {
			const postsQuery = queryCriteriaFromAttributes( block.attributes );
			homepageArticleBlocks.push( { postsQuery, clientId: block.clientId } );
		}
		return homepageArticleBlocks.concat( getBlockQueries( block.innerBlocks ) );
	} );

export const getEditorBlocksIds = blocks =>
	blocks.flatMap( block => {
		const homepageArticleBlocks = [];
		homepageArticleBlocks.push( block.clientId );
		return homepageArticleBlocks.concat( getEditorBlocksIds( block.innerBlocks ) );
	} );
