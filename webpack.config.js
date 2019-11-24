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
const blockList = isDevelopment
	? buildDescription.blocks.development
	: buildDescription.blocks.production;
const blockExtensionList = isDevelopment
	? buildDescription.block_extensions.development
	: buildDescription.block_extensions.production;

/**
 * Internal variables
 */
const editorSetup = path.join( __dirname, 'src', 'setup', 'editor' );
const viewSetup = path.join( __dirname, 'src', 'setup', 'view' );

const blocks = fs
	.readdirSync( path.join( __dirname, 'src', 'blocks' ) )
	.filter( block => blockList.includes( block ) )
	.filter( block => fs.existsSync( path.join( __dirname, 'src', 'blocks', block, 'editor.js' ) ) );

const blockScripts = blocks
	.map( block => path.join( path.join( __dirname, 'src' ), 'blocks', block, 'editor.js' ) )
	.filter( fs.existsSync );

const blockExtensionEditorScripts = fs
	.readdirSync( path.join( __dirname, 'src', 'block-extensions' ) )
	.filter( blockExtension =>
		fs.existsSync( path.join( __dirname, 'src', 'block-extensions', blockExtension, 'editor.js' ) )
	)
	.filter( blockExtension => blockExtensionList.includes( blockExtension ) )
	.map( blockExtension =>
		path.join( __dirname, 'src', 'block-extensions', blockExtension, 'editor.js' )
	);

const blockExtensionViewScripts = fs
	.readdirSync( path.join( __dirname, 'src', 'block-extensions' ) )
	.filter( blockExtension =>
		fs.existsSync( path.join( __dirname, 'src', 'block-extensions', blockExtension, 'view.js' ) )
	)
	.filter( blockExtension => blockExtensionList.includes( blockExtension ) )
	.map( blockExtension =>
		path.join( __dirname, 'src', 'block-extensions', blockExtension, 'view.js' )
	);

// Helps split up each block into its own folder view script
const viewBlocksScripts = blocks.reduce( ( viewBlocks, block ) => {
	const viewScriptPath = path.join( __dirname, 'src', 'blocks', block, 'view.js' );
	if ( fs.existsSync( viewScriptPath ) ) {
		viewBlocks[ block + '/view' ] = [ viewSetup, ...[ viewScriptPath ] ];
	}
	return viewBlocks;
}, {} );

// Combines all the different blocks into one editor.js script
const editorScript = [ editorSetup, ...blockExtensionEditorScripts, ...blockScripts ];

const webpackConfig = getBaseWebpackConfig(
	{ WP: true },
	{
		entry: {
			editor: editorScript,
			block_extensions: blockExtensionViewScripts,
			...viewBlocksScripts,
		},
		'output-path': path.join( __dirname, 'dist' ),
	}
);

module.exports = webpackConfig;
