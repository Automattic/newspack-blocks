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
class WP_REST_Newspack_Author_List_Controller extends WP_REST_Newspack_Authors_Controller {
// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedClassFound

	/**
	 * Constructs the controller.
	 *
	 * @access public
	 */
	public function __construct() {
		$this->namespace = 'newspack-blocks/v1';
		$this->rest_base = 'author-list';
	}

	/**
	 * Registers the necessary REST API routes.
	 *
	 * @access public
	 */
	public function register_routes() {
		// Endpoint to get authors.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			[
				[
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => [ $this, 'get_all_authors' ],
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
	 * Get a list of user roles on this site that have the edit_posts capability.
	 *
	 * @return array List of roles with edit_posts capability.
	 */
	public function get_editable_roles() {
		global $wp_roles;

		return array_reduce(
			$wp_roles->roles,
			function( $acc, $role ) {
				if ( isset( $role['capabilities'] ) && isset( $role['capabilities']['edit_posts'] ) && $role['capabilities']['edit_posts'] ) {
					$acc[] = $role['name'];
				}
				return $acc;
			},
			[]
		);
	}

	/**
	 * Returns a list of combined authors and guest authors.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_all_authors( $request ) {
		$author_type  = ! empty( $request->get_param( 'authorType' ) ) ? $request->get_param( 'authorType' ) : 'all';
		$author_roles = ! empty( $request->get_param( 'authorRoles' ) ) ? $request->get_param( 'authorRoles' ) : $this->get_editable_roles();
		$exclude     = ! empty( $request->get_param( 'exclude' ) ) && is_array( $request->get_param( 'exclude' ) ) ? $request->get_param( 'exclude' ) : []; // Fetch a specific user or guest author by ID.
		$fields      = ! empty( $request->get_param( 'fields' ) ) ? explode( ',', $request->get_param( 'fields' ) ) : [ 'id' ]; // Fields to get. Will return at least id.
		$per_page    = 10;

		// Total number of users and guest authors on the site.
		$guest_author_total = 0;
		$user_total         = 0;
		$current_page       = 1;

		// Array to store all authors.
		$all_guest_authors = [];
		$all_users         = [];

		// Get Co-authors guest authors, only if CAP plugin is active and the author type specified includes guest authors.
		if ( 'users' !== $author_type && class_exists( 'CoAuthors_Guest_Authors' ) ) {
			$guest_author_args = [
				'post_type'      => 'guest-author',
				'posts_per_page' => $per_page,
				'orderby'        => 'title',
				'order'          => 'ASC',
			];

			if ( ! empty( $exclude ) ) {
				$guest_author_args['post__not_in'] = $exclude;
			}

			$results            = new \WP_Query( $guest_author_args );
			$guest_author_total = $results->found_posts;
			$number_of_pages    = $results->max_num_pages;
			$all_guest_authors  = array_merge( $all_guest_authors, $results->posts );

			// Keep querying until we have all guest authors.
			if ( $current_page < $number_of_pages ) {
				while ( $current_page < $number_of_pages ) {
					$current_page               ++;
					$guest_author_args['paged'] = $current_page;
					$results                    = new \WP_Query( $guest_author_args );
					$all_guest_authors          = array_merge( $all_guest_authors, $results->posts );
				}
			}
		}

		if ( 'guest-authors' !== $author_type ) {
			// Reset current page for new query.
			$current_page = 1;

			// Get WP users.
			$user_args = [
				'role__in' => $author_roles,
				'orderby'  => 'display_name',
				'order'    => 'ASC',
				'number'   => $per_page,
			];

			if ( ! empty( $exclude ) ) {
				$user_args['exclude'] = $exclude;
			}

			$results         = new \WP_User_Query( $user_args );
			$user_total      = $results->get_total();
			$number_of_pages = ceil( $user_total / $per_page );
			$all_users       = array_merge( $all_users, $results->get_results() );

			// Keep querying until we have all users.
			if ( $current_page < $number_of_pages ) {
				while ( $current_page < $number_of_pages ) {
					$current_page      ++;
					$user_args['paged'] = $current_page;
					$results           = new \WP_User_Query( $user_args );
					$all_users         = array_merge( $all_users, $results->get_results() );
				}
			}
		}

		// Format and combine results.
		$linked_accounts  = []; // Keep track of linked accounts so we can exclude WP users in favor of the guest authors.
		$combined_authors = array_merge(
			array_reduce(
				$all_guest_authors,
				function( $acc, $guest_author ) use ( $fields, &$linked_accounts ) {
					if ( $guest_author ) {
						if ( class_exists( 'CoAuthors_Guest_Authors' ) ) {
							$last_name         = get_post_meta( $guest_author->ID, 'cap-last_name', true );
							$guest_author_data = [
								'id'         => intval( $guest_author->ID ),
								'registered' => $guest_author->post_date,
								'is_guest'   => true,
								'last_name'  => ! empty( $last_name ) && in_array( $last_name, explode( ' ', $guest_author->post_title ) ) ? $last_name : $guest_author->post_title,
							];

							$linked_account = get_post_meta( $guest_author->ID, 'cap-linked_account', true );
							if ( ! empty( $linked_account ) ) {
								$linked_accounts[] = $linked_account;
							}

							$guest_author = ( new CoAuthors_Guest_Authors() )->get_guest_author_by( 'id', $guest_author->ID );

							if ( in_array( 'login', $fields, true ) ) {
								$guest_author_data['login'] = $guest_author->user_login;
							}
							if ( in_array( 'name', $fields, true ) ) {
								$guest_author_data['name'] = $guest_author->display_name;
							}
							if ( in_array( 'bio', $fields, true ) ) {
								$guest_author_data['bio'] = get_post_meta( $guest_author->ID, 'cap-description', true );
							}
							if ( in_array( 'email', $fields, true ) ) {
								$email_data = $this->get_email( $guest_author->ID );

								if ( $email_data ) {
									$guest_author_data['email'] = $email_data;
								}
							}
							if ( in_array( 'avatar', $fields, true ) && function_exists( 'coauthors_get_avatar' ) ) {
								$guest_author_data['avatar'] = coauthors_get_avatar( $guest_author, 256 );
							}
							if ( in_array( 'url', $fields, true ) ) {
								$guest_author_data['url'] = esc_urL(
									get_site_urL( null, '?author_name=' . get_post_meta( $guest_author->ID, 'cap-user_login', true ) )
								);
							}
							if ( in_array( 'social', $fields, true ) ) {
								$guest_author_data['social'] = $this->get_social( $guest_author->ID );
							}

							$acc[] = $guest_author_data;
						}
					}
					return $acc;
				},
				[]
			),
			array_reduce(
				$all_users,
				function( $acc, $user ) use ( $fields, &$linked_accounts ) {
					if ( $user ) {
						$is_linked = in_array( $user->data->user_login, $linked_accounts );

						// If linked to a guest author, show only the guest author.
						if ( $is_linked ) {
							return $acc;
						}

						$last_name = get_user_meta( intval( $user->data->ID ), 'last_name', true );
						$user_data = [
							'id'         => intval( $user->data->ID ),
							'registered' => $user->data->user_registered,
							'is_guest'   => false,
							'last_name'  => ! empty( $last_name ) && in_array( $last_name, explode( ' ', $user->data->display_name ) ) ? $last_name : $user->data->display_name,
						];

						if ( in_array( 'login', $fields, true ) ) {
							$user_data['login'] = $user->data->user_login;
						}
						if ( in_array( 'name', $fields, true ) ) {
							$user_data['name'] = $user->data->display_name;
						}
						if ( in_array( 'bio', $fields, true ) ) {
							$user_data['bio'] = get_the_author_meta( 'description', $user->data->ID );
						}
						if ( in_array( 'email', $fields, true ) ) {
							$email_data = $this->get_email( $user->data->ID, false, $user->data->user_email );

							if ( $email_data ) {
								$user_data['email'] = $email_data;
							}
						}
						if ( in_array( 'avatar', $fields, true ) ) {
							$user_data['avatar'] = get_avatar( $user->data->ID, 256 );
						}
						if ( in_array( 'url', $fields, true ) ) {
							$user_data['url'] = esc_urL( get_author_posts_url( $user->data->ID ) );
						}
						if ( in_array( 'social', $fields, true ) ) {
							$user_data['social'] = $this->get_social( $user->data->ID );
						}

						$acc[] = $user_data;
					}
					return $acc;
				},
				[]
			)
		);

		// Sort combined authors array by last name (or display name if none).
		usort(
			$combined_authors,
			function( $a, $b ) {
				return strcmp( $a['last_name'], $b['last_name'] );
			}
		);

		$response = new \WP_REST_Response( $combined_authors );
		$response->header( 'x-wp-total', $user_total + $guest_author_total );

		return rest_ensure_response( $response );
	}
}
