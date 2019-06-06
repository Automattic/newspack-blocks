const attributes = {
	className: {
		type: 'string',
	},
	postLayout: {
		type: 'string',
		default: 'list',
	},
	columns: {
		type: 'integer',
		default: 3,
	},
	postsToShow: {
		type: 'integer',
		default: 3,
	},
	mediaPosition: {
		type: 'string',
		default: 'top',
	},
	categories: {
		type: 'string',
	},
	typeScale: {
		type: 'integer',
		default: 4,
	},
	imageScale: {
		type: 'integer',
		default: 3,
	},
	sectionHeader: {
		type: 'string',
		default: '',
	},
}

export default attributes;
