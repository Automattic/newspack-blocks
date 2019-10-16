/**
 **** WARNING: No ES6 modules here. Not transpiled! ****
 */
/* eslint-disable import/no-nodejs-modules */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
// const { workerCount } = require( './webpack.common' ); // todo: shard...

/**
 * Internal variables
 */
const editorSetup = path.join( __dirname, 'src', 'setup', 'editor' );
const viewSetup = path.join( __dirname, 'src', 'setup', 'view' );

function blockScripts( type, inputDir, blocks ) {
	return blocks
		.map( block => path.join( inputDir, 'blocks', block, `${ type }.js` ) )
		.filter( fs.existsSync );
}

const blocksDir = path.join( __dirname, 'src', 'blocks' );
const blocks = fs
  .readdirSync( blocksDir )
  .filter( block => fs.existsSync( path.join( __dirname, 'src', 'blocks', block, 'editor.js' ) ) );


// Helps split up each block into its own folder with view and editor scripts and styles.
// Also creates a script one that combines all editor scripts for all blocks.
const blocksScripts = blocks.reduce( ( scripts, block ) => {
	const viewScriptPath = path.join( __dirname, 'src', 'blocks', block, 'view.js' );
	if ( fs.existsSync( viewScriptPath ) ) {
		scripts[ 'src/blocks/' + block + '/dist/view' ] = [ viewSetup, ...[ viewScriptPath ] ];
	}
	const editorScriptPath = path.join( __dirname, 'src', 'blocks', block, 'editor.js' );
	if ( fs.existsSync( editorScriptPath ) ) {
		scripts[ 'src/blocks/' + block + '/dist/editor' ] = [ editorSetup, ...[ editorScriptPath ] ];
	}
	return scripts;
}, {} );

// Combines all the different blocks into one editor.js script
const combinedEditorScript = [
	editorSetup,
	...blockScripts( 'editor', path.join( __dirname, 'src' ), blocks ),
];

const blockStylesScript = [
	path.join( __dirname, 'src', 'block-styles', 'view' ),
];

const webpackConfig = getBaseWebpackConfig(
	{ WP: true },
	{
		entry: {
			'dist/editor': combinedEditorScript,
			'dist/block_styles': blockStylesScript,
			...blocksScripts,
		},
		'output-path': path.join( __dirname ),
	},
);

console.log(webpackConfig);

module.exports = webpackConfig;
