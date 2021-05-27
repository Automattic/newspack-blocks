<?php
/**
 * WP_REST_Newspack_Authors_Controller file.
 *
 * @package WordPress
 */

// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedClassFound
/**
 * Class WP_REST_Newspack_Authors_Controller.
 */
class WP_REST_Newspack_Authors_Controller extends WP_REST_Controller {
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedClassFound

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->namespace = 'newspack-blocks/v1';
		$this->rest_base = 'authors';
	}

	/**
	 * Registers the necessary REST API routes.
	 *
	 * @access public
	 */
	public function register_routes() {
		// Endpoint to get articles on the front-end.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_authors' ],
					'args'                => [
						'author_id' => [
							'sanitize_callback' => 'absint',
						],
						'offset'    => [
							'sanitize_callback' => 'absint',
						],
						'per_page'  => [
							'sanitize_callback' => 'absint',
						],
						'search'    => [
							'sanitize_callback' => 'sanitize_text_field',
						],
						'fields'    => [
							'sanitize_callback' => 'sanitize_text_field',
						],
					],
					'permission_callback' => '__return_true',
				],
			]
		);
	}

	/**
	 * Returns a list of combined authors and guest authors.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_authors( $request ) {
		$author_id = ! empty( $request->get_param( 'author_id' ) ) ? $request->get_param( 'author_id' ) : 0; // Fetch a specific user or guest author by ID.
		$search    = ! empty( $request->get_param( 'search' ) ) ? $request->get_param( 'search' ) : null; // Fetch authors by search string.
		$offset    = ! empty( $request->get_param( 'offset' ) ) ? $request->get_param( 'offset' ) : 0; // Offset results (for pagination).
		$per_page  = ! empty( $request->get_param( 'per_page' ) ) ? $request->get_param( 'per_page' ) : 10; // Number of results to return per page. This is applied to each query, so the actual number of results returned may be up to 2x this number.
		$fields    = ! empty( $request->get_param( 'fields' ) ) ? explode( ',', $request->get_param( 'fields' ) ) : [ 'id' ]; // Fields to get. Will return at least id.

		// Total number of users and guest authors.
		$guest_author_total = 0;
		$user_total         = 0;

		// Get Co-authors guest authors.
		$guest_author_args = [
			'post_type'      => 'guest-author',
			'posts_per_page' => $per_page,
			'offset'         => $offset,
		];

		if ( $search && ! $author_id ) {
			$guest_author_args['s'] = $search;
		}
		if ( $author_id ) {
			$guest_author_args['p'] = $author_id;
		}

		$guest_authors      = new \WP_Query( $guest_author_args );
		$guest_author_total = $guest_authors->found_posts;

		// Get standard WP users.
		if ( $author_id ) {
			$users = 0 === $guest_author_total ? [ get_user_by( 'id', $author_id ) ] : []; // If passed an author_id and we already found it as guest author, no need to run this query.
		} else {
			$user_args = [
				'role__in' => [ 'Administrator', 'Editor', 'Author', 'Contributor' ],
				'offset'   => $offset,
				'orderby'  => 'registered',
				'order'    => 'DESC',
				'number'   => $per_page,
			];

			// If passed a search string.
			if ( $search && ! $author_id ) {
				$user_args['search'] = '*' . $search . '*';
			}

			$user_query = new \WP_User_Query( $user_args );
			$users      = $user_query->get_results();
			$user_total = $user_query->get_total();
		}

		// Format and combine results.
		$combined_authors = array_merge(
			array_reduce(
				! empty( $guest_authors->posts ) ? $guest_authors->posts : [],
				function( $acc, $guest_author ) use ( $fields ) {
					if ( $guest_author ) {
						$guest_author_data = [ 'id' => intval( $guest_author->ID ) ];

						if ( in_array( 'login', $fields ) ) {
							$guest_author_data['login'] = $guest_author->post_name;
						}
						if ( in_array( 'name', $fields ) ) {
							$guest_author_data['name'] = $guest_author->post_title;
						}
						if ( in_array( 'bio', $fields ) ) {
							$guest_author_data['bio'] = get_post_meta( $guest_author->ID, 'cap-description', true );
						}
						if ( in_array( 'email', $fields ) ) {
							$email_address = get_post_meta( $guest_author->ID, 'cap-user_email', true );

							if ( $email_address ) {
								$guest_author_data['email'] = [ 'mailto' => 'mailto:' . $email_address ];

								if ( class_exists( 'Newspack_SVG_Icons' ) ) {
									$guest_author_data['email']['svg'] = Newspack_SVG_Icons::get_social_link_svg( 'mailto:' . $email_address, 30 );
								}
							}
						}
						if ( in_array( 'avatar', $fields ) ) {
							$guest_author_data['avatar'] = coauthors_get_avatar( $guest_author, 240 );
						}
						if ( in_array( 'url', $fields ) ) {
							$guest_author_data['url'] = esc_urL(
								get_site_urL( null, '?author_name=' . get_post_meta( $guest_author->ID, 'cap-user_login', true ) )
							);
						}

						$acc[] = $guest_author_data;
					}
					return $acc;
				},
				[]
			),
			array_reduce(
				$users,
				function( $acc, $user ) use ( $fields ) {
					if ( $user ) {
						$user_data = [ 'id' => intval( $user->data->ID ) ];

						if ( in_array( 'login', $fields ) ) {
							$user_data['login'] = $user->data->user_login;
						}
						if ( in_array( 'name', $fields ) ) {
							$user_data['name'] = $user->data->display_name;
						}
						if ( in_array( 'bio', $fields ) ) {
							$user_data['bio'] = get_the_author_meta( 'description', $user->data->ID );
						}
						if ( in_array( 'email', $fields ) ) {
							$email_address = $user->data->user_email;

							if ( $email_address ) {
								$user_data['email'] = [ 'url' => 'mailto:' . $email_address ];

								if ( class_exists( 'Newspack_SVG_Icons' ) ) {
									$user_data['email']['svg'] = Newspack_SVG_Icons::get_social_link_svg( 'mailto:' . $email_address, 30 );
								}
							}
						}
						if ( in_array( 'avatar', $fields ) ) {
							$user_data['avatar'] = get_avatar( $user->data->ID, 240 );
						}
						if ( in_array( 'url', $fields ) ) {
							$user_data['url'] = esc_urL( get_author_posts_url( $user->data->ID ) );
						}
						if ( in_array( 'social', $fields ) ) {
							$social_profiles = [
								'facebook',
								'twitter',
								'instagram',
								'linkedin',
								'myspace',
								'pinterest',
								'soundcloud',
								'tumblr',
								'youtube',
								'wikipedia',
							];
							$social_links    = array_reduce(
								$social_profiles,
								function( $acc, $profile ) use ( $user ) {
									$handle = get_the_author_meta( $profile, $user->data->ID );

									if ( $handle ) {
										$url             = 'twitter' === $profile ? esc_url( 'https://twitter.com/' . $handle ) : esc_url( $handle );
										$acc[ $profile ] = [ 'url' => $url ];

										if ( class_exists( 'Newspack_SVG_Icons' ) ) {
											$acc[ $profile ]['svg'] = Newspack_SVG_Icons::get_social_link_svg( $url, 30 );
										}
									}

									return $acc;
								},
								[]
							);

							$user_data['social'] = $social_links;
						}

						$acc[] = $user_data;
					}
					return $acc;
				},
				[]
			)
		);

		$response = new WP_REST_Response( $combined_authors );
		$response->header( 'x-wp-total', $user_total + $guest_author_total );

		return rest_ensure_response( $response );
	}
}
