<?php

/**
 * Class to access posts via the REST API.
 *
 * Optimized for Homepage Articles Block.
 */
class WP_REST_Newspack_Articles_Controller extends WP_REST_Posts_Controller {

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		parent::__construct( 'post' );
		$this->namespace = 'wp/v2';
		$this->rest_base = 'newspack-articles-block';
	}

	/**
	 * Registers the necessary REST API routes.
	 *
	 * @access public
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/articles',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
			)
		);
	}

	/**
	 * Retrieves a collection of posts.
	 *
	 * @param WP_REST_Request $request Full details about the request.
	 * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		$page     = $request->get_param( 'page' );
		$response = parent::get_items( $request );

		$response->data = [ 'items' => $response->data ];

		if ( $page < $response->headers['X-WP-TotalPages'] ) {
			$params                        = $request->get_params();
			$params['__amp_source_origin'] = false;
			$params['page']                = $page + 1;

			$response->data['next'] = add_query_arg( $params, rest_url( $this->namespace . '/' . $this->rest_base . '/articles' ) );
		}

		return $response;
	}
}
