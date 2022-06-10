'use strict';

import { unregisterBlockType } from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';

const removeBlocks = [ 'jetpack/donations' ];

domReady( function () {
	removeBlocks.forEach( function ( blockName ) {
		unregisterBlockType( blockName );
	} );
} );
