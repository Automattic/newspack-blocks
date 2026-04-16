<?php
/**
 * Tests for the Fast Checkout class.
 *
 * @package Newspack_Blocks
 * @group fast-checkout
 */

use Newspack_Blocks\Fast_Checkout;

/**
 * Fast Checkout test case.
 */
class Test_Fast_Checkout extends WP_UnitTestCase_Blocks {

	/**
	 * Reset cache before each test.
	 */
	public function set_up() {
		parent::set_up();
		Fast_Checkout::reset_cache();
	}

	/**
	 * Test that a simple product attribute resolves to the product ID.
	 */
	public function test_resolve_simple_product() {
		$result = Fast_Checkout::resolve_product_id_from_attrs( [ 'product' => '42' ] );
		$this->assertSame( 42, $result );
	}

	/**
	 * Test that a variable product with variation resolves to the variation ID.
	 */
	public function test_resolve_variable_prefers_variation() {
		$result = Fast_Checkout::resolve_product_id_from_attrs(
			[
				'product'     => '42',
				'variation'   => '99',
				'is_variable' => true,
			]
		);
		$this->assertSame( 99, $result );
	}

	/**
	 * Test that a variable product without variation falls back to product ID.
	 */
	public function test_resolve_variable_without_variation_falls_back() {
		$result = Fast_Checkout::resolve_product_id_from_attrs(
			[
				'product'     => '42',
				'is_variable' => true,
			]
		);
		$this->assertSame( 42, $result );
	}

	/**
	 * Test that missing attributes return null.
	 */
	public function test_resolve_missing_returns_null() {
		$result = Fast_Checkout::resolve_product_id_from_attrs( [] );
		$this->assertNull( $result );
	}

	/**
	 * Test extracting product ID from a top-level Fast Checkout block.
	 */
	public function test_get_block_product_id_top_level() {
		$post_id = self::factory()->post->create(
			[
				'post_content' => '<!-- wp:newspack-blocks/fast-checkout {"product":"55"} /-->',
			]
		);
		$post    = get_post( $post_id );
		$result  = Fast_Checkout::get_block_product_id( $post );
		$this->assertSame( 55, $result );
	}

	/**
	 * Test extracting product ID from a Fast Checkout block nested in columns.
	 */
	public function test_get_block_product_id_nested_in_columns() {
		$content = '<!-- wp:columns --><div class="wp-block-columns"><!-- wp:column --><div class="wp-block-column"><!-- wp:newspack-blocks/fast-checkout {"product":"77"} /--></div><!-- /wp:column --></div><!-- /wp:columns -->';
		$post_id = self::factory()->post->create( [ 'post_content' => $content ] );
		$post    = get_post( $post_id );
		$result  = Fast_Checkout::get_block_product_id( $post );
		$this->assertSame( 77, $result );
	}

	/**
	 * Test that a post without a Fast Checkout block returns null.
	 */
	public function test_get_block_product_id_absent() {
		$post_id = self::factory()->post->create(
			[
				'post_content' => '<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->',
			]
		);
		$post    = get_post( $post_id );
		$result  = Fast_Checkout::get_block_product_id( $post );
		$this->assertNull( $result );
	}

	/**
	 * Test that null post returns null.
	 */
	public function test_get_block_product_id_handles_null_post() {
		$result = Fast_Checkout::get_block_product_id( null );
		$this->assertNull( $result );
	}
}
