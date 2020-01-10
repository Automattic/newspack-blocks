module.exports = {
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended',
		'plugin:react/recommended',
		'plugin:jsdoc/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
	],
	env: {
		browser: true,
	},
	rules: {
		// Disallow importing or requiring packages that are not listed in package.json
		// This prevents us from depending on transitive dependencies, which could break in unexpected ways.
		'import/no-extraneous-dependencies': [ 'error' ],
		// Skip prop types validation for now
		'react/prop-types': 'off',
		// Allow exporting components as default exports
		'react/display-name': 'off',
		'react/no-did-mount-set-state': 'error',
		// JSDoc rules overrides
		'jsdoc/require-returns': 'off',
	},
};
