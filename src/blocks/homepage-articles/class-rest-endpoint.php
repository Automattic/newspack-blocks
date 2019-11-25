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
		$attributes = $request->get_param( 'attributes') ?? [];
		$next_page = $page + 1;

		$args           = array(
			'post_status'         => 'publish',
			'suppress_filters'    => false,
			'ignore_sticky_posts' => true,
			'paged'               => $page,
		);

		$article_query = new WP_Query( $args );

		$max_pages = $article_query->max_num_pages;

		// Defaults
		$items = [];
		$next_url = '';


		// The Loop
		while ( $article_query->have_posts() ) : $article_query->the_post();
			$items[]['html'] = newspack_template_inc(__DIR__ . '/article.php', array(
				'attributes' => $attributes,
			));
		endwhile;

		// Don't provide next URL if the next page is out of bounds
		if ($next_page <= $max_pages) {
			$next_url = add_query_arg(array(
				'page' => $next_page,
				'attributes' => $attributes,
			), get_rest_url(null, $this->namespace . '/' . $this->rest_base . '/articles'));
		}

		return rest_ensure_response( [
			'items' => $items,
			'next' => str_replace(get_site_url(), '', $next_url),
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