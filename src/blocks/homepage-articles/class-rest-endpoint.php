<?php

class WP_REST_Newspack_Articles_Controller extends WP_REST_Controller {

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
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
					'callback'            => array( $this, 'get_articles' ),
					'args' => array(
						'page' => array(
							// 'validate_callback' => 'wp_http_validate_url',
							// 'sanitize_callback' => 'esc_url_raw',
						),
					),
					'permission_callback' => array( $this, 'get_articles_permissions_check' ),
				),
			)
		);
	}


	public function get_articles( $request ) {
		$page = $request->get_param( 'page') ?? 1;
		$next_page = $page + 1;

		$items = array_map(function($item) {
			return [
				'html' => "<article>Random string of <strong>HTML</strong> $item</article>",
			];
		}, [1,2,3,4,5,6,7,8,9,10]);

		return rest_ensure_response( [
			'items' => $items,
			'next' => get_rest_url(null, $this->namespace . '/' . $this->rest_base . '/articles?page=' . $next_page),
		] );
	}


	public function get_articles_permissions_check() {
		return true;
	}
}

function np_articles_block_register_rest_routes() {
	$articles_controller = new WP_REST_Newspack_Articles_Controller();
	$articles_controller->register_routes();
}
add_action( 'rest_api_init', 'np_articles_block_register_rest_routes' );