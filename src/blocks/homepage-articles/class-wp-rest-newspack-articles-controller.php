<?php
/**
 * WP_REST_Newspack_Articles_Controller file.
 */

/**
 * Class WP_REST_Newspack_Articles_Controller.
 */
class WP_REST_Newspack_Articles_Controller extends WP_REST_Controller {

	/**
	 * Attribute schema.
	 *
	 * @var array
	 */
	public $attribute_schema;

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->namespace = 'newspack-blocks/v1';
		$this->rest_base = 'articles';
	}

	/**
	 * Registers the necessary REST API routes.
	 *
	 * @access public
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_items' ],
					'args'                => $this->get_attribute_schema(),
					'permission_callback' => '__return_true',
				],
			]
		);
	}

	/**
	 * Returns a list of rendered posts.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$page        = $request->get_param( 'page' ) ?? 1;
		$exclude_ids = $request->get_param( 'exclude_ids' ) ?? [];
		$next_page   = $page + 1;
		$attributes  = wp_parse_args(
			$request->get_params() ?? [],
			wp_list_pluck( $this->get_attribute_schema(), 'default' )
		);

		$article_query_args = Newspack_Blocks::build_articles_query( $attributes );

		// Append custom pagination arg for REST API endpoint.
		$article_query_args['paged'] = $page;

		$query = array_merge(
			$article_query_args,
			[
				'posts_per_page' => $article_query_args['posts_per_page'] + count( $exclude_ids ),
			]
		);

		// Run Query.
		$article_query = new WP_Query( $query );

		// Defaults.
		$items    = [];
		$next_url = '';

		// The Loop.
		$post_counter = 0;
		while ( $article_query->have_posts() ) {
			$article_query->the_post();
			if ( in_array( get_the_id(), $exclude_ids, true ) ) {
				continue;
			}
			if ( ++$post_counter > $article_query_args['posts_per_page'] ) {
				continue;
			}
			$items[]['html'] = Newspack_Blocks::template_inc(
				__DIR__ . '/templates/article.php',
				[
					'attributes' => $attributes,
				]
			);
		}

		// Provide next URL if there are more pages.
		if ( $next_page <= $article_query->max_num_pages ) {
			$next_url = add_query_arg(
				array_merge(
					array_map( function( $attribute ) { return $attribute === false ? '0' : $attribute; }, $attributes ),
					[ 'page' => $next_page ] // phpcs:ignore PHPCompatibility.Syntax.NewShortArray.Found
				),
				rest_url( '/newspack-blocks/v1/articles' )
			);
		}

		return rest_ensure_response( [
			'items' => $items,
			'next'  => $next_url,
		] );
	}

	/**
	 * Sets up and returns attribute schema.
	 *
	 * @return array
	 */
	public function get_attribute_schema() {
		if ( empty( $this->attribute_schema ) ) {
			$block_json = json_decode(
				file_get_contents( __DIR__ . '/block.json' ),
				true
			);
			$this->attribute_schema = array_merge(
				$block_json['attributes'],
				[
					'exclude_ids' => [
						'type'    => 'array',
						'default' => [],
						'items'   => [
							'type' => 'integer',
						],
					],
				]
			);
		}
		return $this->attribute_schema;
	}
}
