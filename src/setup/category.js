/**
 * External dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';
import React from 'react';

/**
 * Internal dependencies
 */
import NewspackLogo from './newspack-logo';

setCategories( [
	...getCategories().filter( ( { slug } ) => slug !== 'newspack' ),
	{
		slug: 'newspack',
		title: 'Newspack',
		icon: <NewspackLogo />,
	},
] );
