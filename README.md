# Newspack Blocks
This plugin is meant to serve as a container for most Newspack Gutenberg blocks. There may be certain blocks that relate to specific functionality in other plugins, in which case they would live with the primary functionality, but besides this exception most will live in this one.

## Setup

To get set up for block development, run `composer install && npm install`

### Generating Builds

To build blocks, run `npm run start`

To clean out the built blocks, run `npm run clean`.

### Developing

To work on Block development and have Webpack watch your files for changes run: `npm start`.

### Building new Blocks

To get started with a new block:

- Duplicate one of the example block directories in `src/`
- Rename the directory to the slug of your block.
- At minimum edit `index.js` and change name and title definitions.
- Add the block slug to the `development` and `production` arrays in `build-description.json`
- Execute `npm run start`. If all went smoothly, you should see a Newspack category in the block picker, and your block should appear within it.

To override elements of the build process:

- Create a Build Description JSON file with the overrides. Use `build-description.json` as a guide. The available fields are:
	- blocks_development: Array of blocks to be built in development builds. All entries must correspond to a directory in `src/blocks`.
	- blocks_production: Array of blocks to be built in production builds.
	- block_extensions_development: Array of block extensions to be built in development builds. All entries must correspond to a directory in `src/block-extensions`. Slashes will be converted to colons, so `core/column` is valid and will cause the contents of `core:column` to be built.
	- block_extensions_production: Array of block extensions to be built in production builds.
	- setup_editor: Entry point for editor setup.
	- setup_view: Entry point for view setup.
- Execute `npm run start --build-description=./path/to/override/document.json`
