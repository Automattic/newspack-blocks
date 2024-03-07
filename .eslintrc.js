require( '@rushstack/eslint-patch/modern-module-resolution' );

module.exports = {
	rules: {
		'@typescript-eslint/ban-ts-comment': 'warn',
	},
	extends: [ './node_modules/newspack-scripts/config/eslintrc.js' ],
};
