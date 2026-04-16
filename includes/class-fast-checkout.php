<?php
/**
 * Newspack Blocks Fast Checkout
 *
 * @package Newspack_Blocks
 */

namespace Newspack_Blocks;

defined( 'ABSPATH' ) || exit;

/**
 * Fast Checkout Class.
 */
final class Fast_Checkout {

	/**
	 * Block name.
	 */
	const BLOCK_NAME = 'newspack-blocks/fast-checkout';

	/**
	 * Bindings source identifier.
	 */
	const BINDINGS_SOURCE = 'newspack-blocks/fast-checkout-product';

	/**
	 * Cart item meta key for source post.
	 */
	const CART_ITEM_SOURCE_KEY = '_newspack_fast_checkout_source_post';

	/**
	 * Block context key for the product ID.
	 */
	const CONTEXT_PRODUCT_KEY = 'newspack-blocks/fastCheckoutProductId';

	/**
	 * Block context key for the variation ID.
	 */
	const CONTEXT_VARIATION_KEY = 'newspack-blocks/fastCheckoutVariationId';

	/**
	 * Core blocks that should receive product context.
	 */
	const CORE_CONTEXT_BLOCKS = [ 'core/heading', 'core/image', 'core/paragraph' ];

	/**
	 * Cache of post ID → product ID lookups.
	 *
	 * @var array
	 */
	private static $post_product_cache = [];

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_action( 'init', [ __CLASS__, 'register_bindings_source' ], 20 );
		add_action( 'wp', [ __CLASS__, 'mark_page_noncacheable' ], 5 );
		add_action( 'wp', [ __CLASS__, 'maybe_replace_cart' ], 10 );
		add_filter( 'render_block_' . self::BLOCK_NAME, [ __CLASS__, 'filter_render' ], 10, 2 );
		add_filter( 'woocommerce_get_return_url', [ __CLASS__, 'maybe_override_return_url' ], 10, 2 );
		add_action( 'woocommerce_checkout_create_order_line_item', [ __CLASS__, 'attach_line_item_meta' ], 10, 4 );
		add_filter( 'block_type_metadata', [ __CLASS__, 'add_context_to_core_blocks' ] );
	}

	/**
	 * Reset the internal cache. Used by tests.
	 */
	public static function reset_cache() {
		self::$post_product_cache = [];
	}

	/**
	 * Resolve the effective product ID from block attributes.
	 *
	 * Returns the variation ID when the product is variable and a variation is set,
	 * otherwise the product ID. Returns null when no product attribute is present.
	 *
	 * @param array $attrs Block attributes.
	 * @return int|null Product or variation ID, or null.
	 */
	public static function resolve_product_id_from_attrs( $attrs ) {
		if ( empty( $attrs['product'] ) ) {
			return null;
		}
		$product_id  = (int) $attrs['product'];
		$is_variable = ! empty( $attrs['is_variable'] );
		$variation   = ! empty( $attrs['variation'] ) ? (int) $attrs['variation'] : 0;

		if ( $is_variable && $variation ) {
			return $variation;
		}
		return $product_id;
	}

	/**
	 * Walk parsed blocks depth-first to find the first Fast Checkout block
	 * and return its resolved product ID.
	 *
	 * Results are cached per post ID.
	 *
	 * @param \WP_Post|null $post The post to inspect.
	 * @return int|null Product ID or null.
	 */
	public static function get_block_product_id( $post ) {
		if ( ! $post ) {
			return null;
		}
		if ( isset( self::$post_product_cache[ $post->ID ] ) ) {
			return self::$post_product_cache[ $post->ID ];
		}
		$blocks = parse_blocks( $post->post_content );
		$result = self::find_fast_checkout_block_product( $blocks );
		self::$post_product_cache[ $post->ID ] = $result;
		return $result;
	}

	/**
	 * Recursively search blocks for the first Fast Checkout block.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return int|null Product ID or null.
	 */
	private static function find_fast_checkout_block_product( $blocks ) {
		foreach ( $blocks as $block ) {
			if ( self::BLOCK_NAME === $block['blockName'] ) {
				return self::resolve_product_id_from_attrs( $block['attrs'] ?? [] );
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$found = self::find_fast_checkout_block_product( $block['innerBlocks'] );
				if ( null !== $found ) {
					return $found;
				}
			}
		}
		return null;
	}

	/**
	 * Register the block bindings source.
	 */
	public static function register_bindings_source() {
		// Stub.
	}

	/**
	 * Mark the current page as non-cacheable when a Fast Checkout block is present.
	 */
	public static function mark_page_noncacheable() {
		// Stub.
	}

	/**
	 * Replace the WooCommerce cart contents with the block's product.
	 */
	public static function maybe_replace_cart() {
		// Stub.
	}

	/**
	 * Filter the rendered output of the Fast Checkout block.
	 *
	 * @param string $content Rendered block content.
	 * @param array  $block   Block data including attrs.
	 * @return string Filtered content.
	 */
	public static function filter_render( $content, $block ) {
		return $content;
	}

	/**
	 * Override the WooCommerce return URL for orders placed via Fast Checkout.
	 *
	 * @param string    $url   Default return URL.
	 * @param \WC_Order $order The order.
	 * @return string Possibly overridden URL.
	 */
	public static function maybe_override_return_url( $url, $order ) {
		return $url;
	}

	/**
	 * Attach source post meta to order line items.
	 *
	 * @param \WC_Order_Item_Product $item          The line item.
	 * @param string                 $cart_item_key Cart item key.
	 * @param array                  $values        Cart item values.
	 * @param \WC_Order              $order         The order.
	 */
	public static function attach_line_item_meta( $item, $cart_item_key, $values, $order ) {
		// Stub.
	}

	/**
	 * Add product context keys to core block metadata.
	 *
	 * @param array $metadata Block type metadata.
	 * @return array Filtered metadata.
	 */
	public static function add_context_to_core_blocks( $metadata ) {
		return $metadata;
	}
}

Fast_Checkout::init();
