<?php

class WP_REST_Newspack_Articles_Controller extends WP_REST_Controller {

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->namespace = 'v2';
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
						// 'url' => array(
						// 	'validate_callback' => 'wp_http_validate_url',
						// 	'sanitize_callback' => 'esc_url_raw',
						// ),
					),
					'permission_callback' => array( $this, 'get_remote_url_permissions_check' ),
				),
			)
		);
	}


	public function get_articles( $request ) {
		return rest_ensure_response( ['some article data here'] );
	}


	public function get_remote_url_permissions_check() {
		return true;
	}
}

function np_articles_block_register_rest_routes() {
	$articles_controller = new WP_REST_Newspack_Articles_Controller();
	$articles_controller->register_routes();
}
add_action( 'rest_api_init', 'np_articles_block_register_rest_routes' );