<?php
/**
 * Newspack Blocks caching class file.
 *
 * @package WordPress
 */

/**
 * Class Newspack_Blocks_Cache.
 *
 * A central caching mechanism.
 */
class Newspack_Blocks_Cache {

	/**
	 * In seconds.
	 */
	const CACHE_EXPIRE = 600;

	/**
	 * Checks whether cache is enabled.
	 *
	 * @return bool
	 */
	public static function is_caching_enabled() {
		return defined( 'NEWSPACK_CACHE_BLOCKS' ) ? (bool) NEWSPACK_CACHE_BLOCKS : false;
	}

	/**
	 * A wrapper for global function wp_cache_add.
	 * Adds data to the cache, if the cache key doesn't already exist.
	 *
	 * @see WP_Object_Cache::add()
	 *
	 * @param int|string $key    The cache key to use for retrieval later.
	 * @param mixed      $data   The data to add to the cache.
	 * @param string     $group  Optional. The group to add the cache to. Enables the same key
	 *                           to be used across groups. Default empty.
	 * @param int        $expire Optional. When the cache data should expire, in seconds.
	 *                           Default 0 (no expiration).
	 *
	 * @return bool True on success, false if cache key and group already exist.
	 */
	public static function add( $key, $data, $group = 'newspack', $expire = self::CACHE_EXPIRE ) {
		if ( ! self::is_caching_enabled() ) {
			return false;
		}

		return wp_cache_add( $key, $data, $group, $expire );
	}

	/**
	 * A wrapper for global function wp_cache_get.
	 * Retrieves the cache contents from the cache by key and group.
	 *
	 * @see WP_Object_Cache::get()
	 *
	 * @param int|string $key    The key under which the cache contents are stored.
	 * @param string     $group  Optional. Where the cache contents are grouped. Default empty.
	 * @return bool|mixed False on failure to retrieve contents or the cache contents on success.
	 */
	public static function get( $key, $group = 'newspack' ) {
		if ( ! self::is_caching_enabled() ) {
			return false;
		}

		return wp_cache_get( $key, $group );
	}

	/**
	 * A wrapper for global function wp_cache_flush();
	 * Removes all cache items.
	 *
	 * @see WP_Object_Cache::flush()
	 *
	 * @return bool True on success, false on failure.
	 */
	public static function flush() {
		return wp_cache_flush();
	}
}
