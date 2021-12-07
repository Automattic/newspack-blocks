module.exports = api => {
	api.cache( true );
	return {
		presets: [
			[ '@babel/preset-env' ],
			'@automattic/calypso-build/babel/default',
			'@automattic/calypso-build/babel/wordpress-element',
		],
	};
};
