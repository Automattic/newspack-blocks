<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Class HomepagePostsBlockTest
 *
 * @package Newspack_Blocks
 */

/**
 * Homepage Posts Block test case.
 */
class HomepagePostsBlockTest extends WP_UnitTestCase_Blocks { // phpcs:ignore
	/**
	 * HPB query from attributes.
	 */
	public function test_hpb_build_articles_query() {
		$cases = [
			[
				'block_attributes'        => [
					'postsToShow' => 5,
				],
				'resulting_query_partial' => [
					'posts_per_page' => 5,
					'post_status'    => [ 'publish' ],
					'post_type'      => [ 'post' ],
				],
				'description'             => 'Default attributes',
			],
			[
				'block_attributes'        => [
					'postsToShow' => 1,
					'postType'    => 'some-type',
					'authors'     => [ 1 ],
				],
				'resulting_query_partial' => [
					'posts_per_page' => 1,
					'post_type'      => 'some-type',
					'author__in'     => [ 1 ],
				],
				'description'             => 'With custom post type and author',
				'ignore_tax_query'        => true,
			],
		];

		foreach ( $cases as $case ) {
			$result = Newspack_Blocks::build_articles_query( $case['block_attributes'], 'newspack-blocks/homepage-articles' );
			if ( isset( $case['ignore_tax_query'] ) && $case['ignore_tax_query'] ) {
				// Tax query is an implementation detail in some cases.
				unset( $result['tax_query'] );
			}
			$this->assertEquals(
				self::get_args_with_defaults( $case['resulting_query_partial'] ),
				$result,
				$case['description']
			);
		}
	}

	/**
	 * Query with a CAP (guest) author.
	 */
	public function test_hpb_wp_query() {
		$cap_author = self::create_guest_author();
		$post_id    = self::create_post( null, $cap_author['term_id'] );

		// Create another post.
		self::create_post();

		$query = self::query_from_attributes(
			[
				'postsToShow' => 1,
				'authors'     => [ $cap_author['id'] ],
			]
		);

		self::assertEquals( 1, count( $query->posts ), 'There is one post returned.' );
		self::assertEquals( $post_id, $query->posts[0]->ID, 'The post returned is the one with the CAP author assigned.' );
	}

	/**
	 * `matchAllConditions` option, using taxonomies.
	 */
	public function test_hpb_match_all_conditions_taxonomies() {
		$cat_1_id           = wp_create_term( 'cat-1', 'category' )['term_id'];
		$tag_1_id           = wp_create_term( 'tag-1' )['term_id'];
		$post_with_cat_1_id = self::create_post(
			[
				'post_category' => [ $cat_1_id ],
			]
		);
		$post_with_tag_1_id = self::create_post(
			[
				'tags_input' => [ $tag_1_id ],
			]
		);

		$query_with_category_1 = self::query_from_attributes(
			[
				'categories' => [ $cat_1_id ],
			]
		);
		self::assertEquals(
			[ $post_with_cat_1_id ],
			array_column( $query_with_category_1->posts, 'ID' ),
			'Only the post with the selected category is returned.'
		);

		$query_with_tag_1 = self::query_from_attributes(
			[
				'tags' => [ $tag_1_id ],
			]
		);
		self::assertEquals(
			[ $post_with_tag_1_id ],
			array_column( $query_with_tag_1->posts, 'ID' ),
			'Only the post with the selected tag is returned.'
		);

		$query_with_tag_and_category = self::query_from_attributes(
			[
				'categories' => [ $cat_1_id ],
				'tags'       => [ $tag_1_id ],
			]
		);
		self::assertEquals(
			[],
			$query_with_tag_and_category->posts,
			'No posts are returned since no posts have both category-1 and tag-1.'
		);

		$query_with_tag_and_category_but_dont_match_all = self::query_from_attributes(
			[
				'categories'         => [ $cat_1_id ],
				'tags'               => [ $tag_1_id ],
				'matchAllConditions' => false,
			]
		);
		self::assertEquals(
			[ $post_with_cat_1_id, $post_with_tag_1_id ],
			array_column( $query_with_tag_and_category_but_dont_match_all->posts, 'ID' ),
			'Both posts are returned if not all conditions should be matched.'
		);
	}
}
