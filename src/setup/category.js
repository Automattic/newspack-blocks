/**
 * External dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';

setCategories( [
	...getCategories().filter( ( { slug } ) => slug !== 'newspack' ),
	{
		slug: 'newspack',
		title: 'Newspack',
	},
] );
