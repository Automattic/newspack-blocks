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
					'args'                => [
						'page'       => [
							'type' => 'integer',
						],
						'attributes' => [
							'validate_callback' => [ $this, 'validate_attributes' ],
							'sanitize_callback' => [ $this, 'sanitize_attributes' ],
						],
					],
					'permission_callback' => '__return_true',
				],
			]
		);
	}

	/**
	 * Validates block attributes.
	 *
	 * @param array $attributes Block attributes to validate.
	 * @return bool
	 */
	public function validate_attributes( $attributes ) {
		$schema = $this->get_attribute_schema();

		foreach ( $attributes as $param => $value ) {
			if ( ! rest_validate_value_from_schema( $value, $schema[ $param ], $param ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Sanitizes block attributes.
	 *
	 * @param array $attributes Block attributes to sanitize.
	 * @return array Sanitized block attributes.
	 */
	public function sanitize_attributes( $attributes ) {
		$schema = $this->get_attribute_schema();

		foreach ( $attributes as $param => $value ) {
			$attributes[ $param ] = rest_sanitize_value_from_schema( $value, $schema[ $param ] );
		}

		return $attributes;
	}

	/**
	 * Returns a list of rendered posts.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_items( $request ) {
		$page       = $request->get_param( 'page' ) ?? 1;
		$attributes = $request->get_param( 'attributes' ) ?? [];
		$next_page  = $page + 1;

		$article_query_args = newspack_build_articles_query( $attributes );

		// Append custom pagination arg for REST API endpoint.
		$article_query_args['paged'] = $page;

		// Run Query.
		$article_query = new WP_Query( $article_query_args );

		// Defaults.
		$items    = [];
		$next_url = '';

		// The Loop.
		while ( $article_query->have_posts() ) {
			$article_query->the_post();

			$items[]['html'] = newspack_template_inc(
				__DIR__ . '/article.php',
				[
					'attributes' => $attributes,
				]
			);
		}

		// Provide next URL if there are more pages.
		if ( $next_page <= $article_query->max_num_pages ) {
			$next_url = add_query_arg(
				[
					'page'       => $next_page,
					'attributes' => $attributes,
				],
				rest_url( $this->namespace . '/' . $this->rest_base )
			);
		}

		return rest_ensure_response( [
			'items' => $items,
			'next'  => $next_url,
		] );
	}

	/**
	 * Sets up and returns attribute schema.
	 * @return array
	 */
	public function get_attribute_schema() {
		if ( empty( $this->attribute_schema ) ) {
			$block_json = json_decode(
				file_get_contents( __DIR__ . '/block.json' ),
				true
			);
			$this->attribute_schema = $block_json['attributes'];
		}

		return $this->attribute_schema;
	}
}
