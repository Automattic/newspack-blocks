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
const _ = require( 'lodash' );

// Read Build Description from default and optional override .json files.
const isDevelopment = process.env.NODE_ENV !== 'production';
const baseBuildDescription = JSON.parse( fs.readFileSync( 'build-description.json' ) );
const customBuildDescription = process.env.npm_config_build_description
	? JSON.parse( fs.readFileSync( process.env.npm_config_build_description ) )
	: {};
const buildDescription = _.assign( baseBuildDescription, customBuildDescription );

// Get lists  of blocks and block extensions to build.
const blockList = isDevelopment
	? buildDescription.blocks_development
	: buildDescription.blocks_production;

const blockExtensionList = isDevelopment
	? buildDescription.block_extensions_development
	: buildDescription.block_extensions_production;

// Get paths to Editor and View setup entry points.
const editorSetup =
	_.has( buildDescription, 'setup_editor' ) && buildDescription.setup_editor
		? path.join( __dirname, buildDescription.setup_editor )
		: null;

const viewSetup =
	_.has( buildDescription, 'setup_view' ) && buildDescription.setup_view
		? path.join( __dirname, buildDescription.setup_view )
		: null;

// Get editor and view script paths for all blocks.
const blocks = fs
	.readdirSync( path.join( __dirname, 'src', 'blocks' ) )
	.filter( block => blockList.includes( block ) )
	.filter( block => fs.existsSync( path.join( __dirname, 'src', 'blocks', block, 'editor.js' ) ) );

const blockScripts = blocks
	.map( block => path.join( path.join( __dirname, 'src' ), 'blocks', block, 'editor.js' ) )
	.filter( fs.existsSync );

const viewBlocksScripts = blocks.reduce( ( viewBlocks, block ) => {
	const viewScriptPath = path.join( __dirname, 'src', 'blocks', block, 'view.js' );
	if ( fs.existsSync( viewScriptPath ) ) {
		viewBlocks[ block + '/view' ] = [ viewSetup, ...[ viewScriptPath ] ].filter( obj => obj );
	}
	return viewBlocks;
}, {} );

// Get editor and view script paths for all block extensions.
const blockExtensionEditorScripts = fs
	.readdirSync( path.join( __dirname, 'src', 'block-extensions' ) )
	.filter( blockExtension =>
		fs.existsSync( path.join( __dirname, 'src', 'block-extensions', blockExtension, 'editor.js' ) )
	)
	.filter(
		// Since slashes are illegal in directory names, replace / with : allowing use of the real block tags (e.g. core/image)
		blockExtension =>
			blockExtensionList.includes( blockExtension ) ||
			blockExtensionList.includes( blockExtension.replace( ':', '/' ) )
	)
	.map( blockExtension =>
		path.join( __dirname, 'src', 'block-extensions', blockExtension, 'editor.js' )
	);

const blockExtensionViewScripts = fs
	.readdirSync( path.join( __dirname, 'src', 'block-extensions' ) )
	.filter( blockExtension =>
		fs.existsSync( path.join( __dirname, 'src', 'block-extensions', blockExtension, 'view.js' ) )
	)
	.filter(
		blockExtension =>
			blockExtensionList.includes( blockExtension ) ||
			blockExtensionList.includes( blockExtension.replace( ':', '/' ) )
	)
	.map( blockExtension =>
		path.join( __dirname, 'src', 'block-extensions', blockExtension, 'view.js' )
	);

// Combines all the different blocks into one editor.js script
const editorScript = [ editorSetup, ...blockExtensionEditorScripts, ...blockScripts ].filter(
	obj => obj
);

const entry = {
	editor: editorScript,
	...viewBlocksScripts,
};

// If block extensions is an empty array webpack will throw an error.
if ( blockExtensionViewScripts.length > 0 ) {
	entry.block_extensions = blockExtensionViewScripts;
}

const webpackConfig = getBaseWebpackConfig(
	{ WP: true },
	{
		entry,
		'output-path': path.join( __dirname, 'dist' ),
	}
);

module.exports = webpackConfig;
