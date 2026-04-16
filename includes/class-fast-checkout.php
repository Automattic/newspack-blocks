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
		if ( ! function_exists( 'register_block_bindings_source' ) ) {
			return;
		}
		register_block_bindings_source(
			self::BINDINGS_SOURCE,
			[
				'label'              => __( 'Fast Checkout Product', 'newspack-blocks' ),
				'get_value_callback' => [ __CLASS__, 'bindings_get_value' ],
				'uses_context'       => [ self::CONTEXT_PRODUCT_KEY, self::CONTEXT_VARIATION_KEY ],
			]
		);
	}

	/**
	 * Resolve a product field value for block bindings.
	 *
	 * @param array  $source_args    Source arguments including 'field'.
	 * @param object $block          The block instance with context.
	 * @param string $attribute_name The bound attribute name.
	 * @return string Resolved value or empty string.
	 */
	public static function bindings_get_value( $source_args, $block, $attribute_name ) {
		$field        = $source_args['field'] ?? '';
		$product_id   = $block->context[ self::CONTEXT_PRODUCT_KEY ] ?? 0;
		$variation_id = $block->context[ self::CONTEXT_VARIATION_KEY ] ?? 0;

		// Variation takes precedence.
		$resolved_id = $variation_id ? (int) $variation_id : (int) $product_id;
		if ( ! $resolved_id ) {
			return '';
		}

		if ( ! function_exists( 'wc_get_product' ) ) {
			return '';
		}

		$product = wc_get_product( $resolved_id );
		if ( ! $product ) {
			return '';
		}

		switch ( $field ) {
			case 'title':
				return $product->get_name();
			case 'short_description':
				return $product->get_short_description();
			case 'price':
				return wc_price( $product->get_price() );
			case 'price_raw':
				return (string) $product->get_price();
			case 'image_url':
				$image_url = wp_get_attachment_image_url( $product->get_image_id(), 'large' );
				return $image_url ? $image_url : '';
			case 'url':
				return get_permalink( $product->get_id() );
			default:
				return '';
		}
	}

	/**
	 * Mark the current page as non-cacheable when a Fast Checkout block is present.
	 */
	public static function mark_page_noncacheable() {
		if ( is_admin() || ! is_singular() ) {
			return;
		}
		$post = get_post();
		if ( ! $post || ! has_block( self::BLOCK_NAME, $post ) ) {
			return;
		}
		if ( ! defined( 'DONOTCACHEPAGE' ) ) {
			define( 'DONOTCACHEPAGE', true );
		}
		nocache_headers();
	}

	/**
	 * Replace the WooCommerce cart contents with the block's product.
	 */
	public static function maybe_replace_cart() {
		if ( is_admin() && ! wp_doing_ajax() ) {
			return;
		}
		if ( ! function_exists( 'WC' ) || ! is_singular() ) {
			return;
		}
		$post = get_post();
		if ( ! $post || ! has_block( self::BLOCK_NAME, $post ) ) {
			return;
		}
		$product_id = self::get_block_product_id( $post );
		if ( ! $product_id ) {
			return;
		}
		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_purchasable() ) {
			return;
		}
		$cart = WC()->cart;
		if ( ! $cart ) {
			return;
		}

		// Idempotency: if the cart already has exactly the right item, do nothing.
		$cart_contents = $cart->get_cart();
		if ( 1 === count( $cart_contents ) ) {
			$item       = reset( $cart_contents );
			$matches_id = ( $product->is_type( 'variation' ) )
				? (int) $item['variation_id'] === $product_id
				: (int) $item['product_id'] === $product_id;
			if ( $matches_id && 1 === (int) $item['quantity'] ) {
				return;
			}
		}

		// Build cart item data.
		$cart_item_data = [
			self::CART_ITEM_SOURCE_KEY => $post->ID,
		];

		/**
		 * Filter the cart item data added by Fast Checkout.
		 *
		 * @param array    $cart_item_data Cart item data.
		 * @param int      $product_id     Resolved product or variation ID.
		 * @param \WP_Post $post           The source post.
		 */
		$cart_item_data = apply_filters( 'newspack_blocks_fast_checkout_cart_item_data', $cart_item_data, $product_id, $post );

		$cart->empty_cart();

		if ( $product->is_type( 'variation' ) ) {
			$parent_id = $product->get_parent_id();
			$cart->add_to_cart( $parent_id, 1, $product_id, [], $cart_item_data );
		} else {
			$cart->add_to_cart( $product_id, 1, 0, [], $cart_item_data );
		}
	}

	/**
	 * Filter the rendered output of the Fast Checkout block.
	 *
	 * @param string $content Rendered block content.
	 * @param array  $block   Block data including attrs.
	 * @return string Filtered content.
	 */
	public static function filter_render( $content, $block ) {
		$attrs      = $block['attrs'] ?? [];
		$product_id = self::resolve_product_id_from_attrs( $attrs );

		if ( $product_id && function_exists( 'wc_get_product' ) ) {
			$product = wc_get_product( $product_id );
			if ( $product && $product->is_purchasable() ) {
				return $content;
			}
		}

		return '<div class="wp-block-newspack-blocks-fast-checkout--unavailable">'
			. esc_html__( 'This product is no longer available.', 'newspack-blocks' )
			. '</div>';
	}

	/**
	 * Override the WooCommerce return URL for orders placed via Fast Checkout.
	 *
	 * @param string    $url   Default return URL.
	 * @param \WC_Order $order The order.
	 * @return string Possibly overridden URL.
	 */
	public static function maybe_override_return_url( $url, $order ) {
		if ( ! is_object( $order ) || ! method_exists( $order, 'get_items' ) ) {
			return $url;
		}
		foreach ( $order->get_items() as $item ) {
			$source_post_id = $item->get_meta( self::CART_ITEM_SOURCE_KEY );
			if ( ! $source_post_id ) {
				continue;
			}
			$custom_url = self::get_after_success_url( (int) $source_post_id );
			if ( $custom_url ) {
				return $custom_url;
			}
		}
		return $url;
	}

	/**
	 * Get the afterSuccessURL from a Fast Checkout block in a post.
	 *
	 * @param int $post_id Post ID.
	 * @return string Custom URL or empty string.
	 */
	private static function get_after_success_url( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return '';
		}
		$blocks = parse_blocks( $post->post_content );
		$block  = self::find_fast_checkout_block( $blocks );
		if ( ! $block ) {
			return '';
		}
		return $block['attrs']['afterSuccessURL'] ?? '';
	}

	/**
	 * Recursively find the first Fast Checkout block.
	 *
	 * @param array $blocks Parsed blocks.
	 * @return array|null Block array or null.
	 */
	private static function find_fast_checkout_block( $blocks ) {
		foreach ( $blocks as $block ) {
			if ( self::BLOCK_NAME === $block['blockName'] ) {
				return $block;
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$found = self::find_fast_checkout_block( $block['innerBlocks'] );
				if ( $found ) {
					return $found;
				}
			}
		}
		return null;
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
		if ( ! isset( $values[ self::CART_ITEM_SOURCE_KEY ] ) ) {
			return;
		}
		if ( is_object( $item ) && method_exists( $item, 'add_meta_data' ) ) {
			$item->add_meta_data( self::CART_ITEM_SOURCE_KEY, (int) $values[ self::CART_ITEM_SOURCE_KEY ], true );
		}
	}

	/**
	 * Add product context keys to core block metadata.
	 *
	 * @param array $metadata Block type metadata.
	 * @return array Filtered metadata.
	 */
	public static function add_context_to_core_blocks( $metadata ) {
		if ( ! is_array( $metadata ) || empty( $metadata['name'] ) ) {
			return $metadata;
		}
		if ( ! in_array( $metadata['name'], self::CORE_CONTEXT_BLOCKS, true ) ) {
			return $metadata;
		}
		$existing = isset( $metadata['usesContext'] ) && is_array( $metadata['usesContext'] )
			? $metadata['usesContext']
			: [];
		$metadata['usesContext'] = array_values(
			array_unique(
				array_merge( $existing, [ self::CONTEXT_PRODUCT_KEY, self::CONTEXT_VARIATION_KEY ] )
			)
		);
		return $metadata;
	}
}

Fast_Checkout::init();
