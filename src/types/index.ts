declare global {
	interface Window {
		wpcomGutenberg: {
			blogPublic: string;
		};
		newspack_blocks_data: { assets_path: string };
	}

	type PostId = number;
	type CategoryId = number;
	type TagId = number;
	type AuthorId = number;

	type PostType = { name: string; slug: string; supports: { newspack_blocks: boolean } };

	type PostsQuery = {
		include?: PostId[];
		excerpt_length?: number;
		show_excerpt?: boolean;
	};

	type Block = {
		name: string;
		clientId: string;
		attributes: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			[ key: string ]: any;
		};
		innerBlocks: Block[];
	};

	type Post = {
		id: number;
	};
}

export {};
