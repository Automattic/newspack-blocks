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

		// TODO: DRY up usage with `view.php`
		global $newspack_blocks_post_id;
		if ( ! $newspack_blocks_post_id ) {
			$newspack_blocks_post_id = array();
		}
		$authors        = isset( $attributes['authors'] ) ? $attributes['authors'] : array();
		$categories     = isset( $attributes['categories'] ) ? $attributes['categories'] : array();
		$tags           = isset( $attributes['tags'] ) ? $attributes['tags'] : array();
		$specific_posts = isset( $attributes['specificPosts'] ) ? $attributes['specificPosts'] : array();
		$posts_to_show  = intval( $attributes['postsToShow'] );
		$specific_mode  = intval( $attributes['specificMode'] );

		// Default args
		$args           = array(
			'post_status'         => 'publish',
			'suppress_filters'    => false,
			'ignore_sticky_posts' => true,
		);

		if ( $specific_mode && $specific_posts ) {
			$args['post__in'] = $specific_posts;
			$args['orderby']  = 'post__in';
		} else {
			$args['posts_per_page'] = $posts_to_show + count( $newspack_blocks_post_id );

			if ( $authors ) {
				$args['author__in'] = $authors;
			}
			if ( $categories ) {
				$args['category__in'] = $categories;
			}
			if ( $tags ) {
				$args['tag__in'] = $tags;
			}
		}

		// Custom arg for endpoint
		$args['paged'] = $page;

		$article_query = new WP_Query( $args );

		$next_page_out_of_bounds = $next_page > $article_query->max_num_pages;

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
		if (!$next_page_out_of_bounds) {
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