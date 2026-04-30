<?php
/**
 * Tests for the Fast Checkout selector blocks (variation, grouped, NYP).
 *
 * @package Newspack_Blocks
 * @group fast-checkout-selectors
 */

/**
 * Fast Checkout selectors test case.
 */
class Test_Fast_Checkout_Selectors extends WP_UnitTestCase_Blocks {

	/**
	 * Skip the current test if WooCommerce is not available.
	 */
	private function skip_without_wc() {
		if ( ! function_exists( 'WC' ) || ! class_exists( 'WC_Product_Variable' ) ) {
			$this->markTestSkipped( 'WooCommerce is not available.' );
		}
	}

	/**
	 * Create a variable product with two attributes (color, size).
	 *
	 * @return array { 'parent': WC_Product_Variable, 'variations': WC_Product_Variation[] }
	 */
	private function create_variable_product() {
		$parent = new \WC_Product_Variable();
		$parent->set_name( 'Test Variable Product' );
		$parent->set_status( 'publish' );

		$attribute_color = new \WC_Product_Attribute();
		$attribute_color->set_name( 'Color' );
		$attribute_color->set_options( [ 'Red', 'Blue' ] );
		$attribute_color->set_visible( true );
		$attribute_color->set_variation( true );

		$attribute_size = new \WC_Product_Attribute();
		$attribute_size->set_name( 'Size' );
		$attribute_size->set_options( [ 'S', 'M' ] );
		$attribute_size->set_visible( true );
		$attribute_size->set_variation( true );

		$parent->set_attributes( [ $attribute_color, $attribute_size ] );
		$parent->save();

		$variations = [];
		foreach ( [
			[ 'Red', 'S' ],
			[ 'Red', 'M' ],
			[ 'Blue', 'S' ],
			[ 'Blue', 'M' ],
		] as [ $color, $size ] ) {
			$v = new \WC_Product_Variation();
			$v->set_parent_id( $parent->get_id() );
			$v->set_attributes( [ 'color' => $color, 'size' => $size ] );
			$v->set_regular_price( '10.00' );
			$v->set_status( 'publish' );
			$v->save();
			$variations[] = $v;
		}

		// Reload parent so it picks up the variations.
		$parent = wc_get_product( $parent->get_id() );
		return [ 'parent' => $parent, 'variations' => $variations ];
	}

	/**
	 * Test that the variation-selector renders one fieldset per attribute.
	 */
	public function test_variation_selector_renders_attribute_fieldsets() {
		$this->skip_without_wc();
		$fixture = $this->create_variable_product();

		$block_html = sprintf(
			'<!-- wp:newspack-blocks/fast-checkout {"product":"%d","is_variable":true} -->
				<div class="wp-block-newspack-blocks-fast-checkout">
					<!-- wp:newspack-blocks/fast-checkout-variation-selector /-->
				</div>
			<!-- /wp:newspack-blocks/fast-checkout -->',
			$fixture['parent']->get_id()
		);

		$rendered = do_blocks( $block_html );

		$this->assertStringContainsString( '<fieldset', $rendered );
		$this->assertStringContainsString( '<legend>Color</legend>', $rendered );
		$this->assertStringContainsString( '<legend>Size</legend>', $rendered );
		$this->assertStringContainsString( 'value="red"', $rendered );
		$this->assertStringContainsString( 'value="blue"', $rendered );
		$this->assertStringContainsString( 'value="s"', $rendered );
		$this->assertStringContainsString( 'value="m"', $rendered );
	}

	/**
	 * Test that the variation-selector pre-checks the editor's chosen variation.
	 */
	public function test_variation_selector_pre_checks_editor_variation() {
		$this->skip_without_wc();
		$fixture = $this->create_variable_product();
		$blue_m  = $fixture['variations'][3]; // [ 'Blue', 'M' ]

		$block_html = sprintf(
			'<!-- wp:newspack-blocks/fast-checkout {"product":"%d","is_variable":true,"variation":"%d"} -->
				<div class="wp-block-newspack-blocks-fast-checkout">
					<!-- wp:newspack-blocks/fast-checkout-variation-selector /-->
				</div>
			<!-- /wp:newspack-blocks/fast-checkout -->',
			$fixture['parent']->get_id(),
			$blue_m->get_id()
		);

		$rendered = do_blocks( $block_html );

		// Both 'blue' and 'm' radios should be checked.
		$this->assertMatchesRegularExpression( '/value="blue"[^>]*checked/', $rendered );
		$this->assertMatchesRegularExpression( '/value="m"[^>]*checked/', $rendered );
	}
}
