<?php
/**
 * Server-side rendering of the `newspack-blocks/query` block.
 *
 * @package WordPress
 */
$basePath = dirname( __FILE__ );
include_once( 'field-blocks/author/author.php' );
include_once( $basePath . '/field-blocks/categories/categories.php' );
include_once( $basePath . '/field-blocks/date/date.php' );
include_once( $basePath . '/field-blocks/excerpt/excerpt.php' );
include_once( $basePath . '/field-blocks/featured-image/featured-image.php' );
include_once( $basePath . '/field-blocks/tags/tags.php' );
include_once( $basePath . '/field-blocks/title/title.php' );

class Newspack_Blocks_Query {
	/**
	 * @var array
	 */
	private static $displayedPostIds = array();

	/**
	 * Registers the `newspack-blocks/query` block on server.
	 */
	public static function init() {
		$queryBlock = new Newspack_Blocks_Query();

		register_block_type(
			'newspack-blocks/query',
			array(
				'attributes'      => array(
					'className' => array(
						'type' => 'string',
					),
					'criteria'  => array(
						'type'    => 'object',
						'default' => array(
							'per_page' => 3,
						),
					),
				),
				'render_callback' => [ $queryBlock, 'newspack_blocks_render_block_query' ],
			)
		);
	}

	/**
	 * Renders the `newspack-blocks/query` block on server.
	 *
	 * @param array $attributes The block attributes.
	 *
	 * @return string Returns the post content with latest posts added.
	 */
	public function newspack_blocks_render_block_query( $attributes ) {
		$blocks = ! empty( $attributes['blocks'] ) ? $attributes['blocks'] : array();
		$args = $this->newspack_blocks_criteria_to_args( $attributes['criteria'] );
		$args['per_page'] = $args['per_page'] + count( self::$displayedPostIds );

		$query = new WP_Query( $args );

		$classes = Newspack_Blocks::block_classes( 'query', $attributes );
		ob_start();
		?>
		<div class="<?php echo esc_attr( $classes ); ?>">
			<?php if ( $query->have_posts() ) : ?>
				<?php while ( $query->have_posts() ) : ?>
					<?php
						$query->the_post();
						$id = get_the_ID();
						if ( in_array( $id, self::$displayedPostIds ) ) {
							continue;
						} else {
							array_push( self::$displayedPostIds, $id );
						}
					?>
					<div class="entry-wrapper">
					<?php
					foreach ( $blocks as $block ) {
						$block_data = array(
							'blockName'    => $block['name'],
							'attrs'        => $block['attributes'],
							'innerContent' => array(),
						);

						$allowed_html         = wp_kses_allowed_html( 'post' );
						$allowed_html['time'] = array(
							'class'    => true,
							'datetime' => true,
						);

						echo wp_kses( render_block( $block_data ), $allowed_html );
					}
					?>
					</div>
					<?php endwhile; ?>
				<?php endif; ?>
		</div>
		<?php
		Newspack_Blocks::enqueue_view_assets( 'query' );
		return ob_get_clean();
	}

	/**
	 * Convert criteria object into args ready for use in WP_Query
	 *
	 * @param array $criteria A criteria object.
	 *
	 * @return array Return an array of args.
	 */
	private function newspack_blocks_criteria_to_args( $criteria ) {
		$args = array(
			'posts_per_page'      => ! empty( $criteria['per_page'] ) ? intval( $criteria['per_page'] ) : 3,
			'offset'              => ! empty( $criteria['offset'] ) ? intval( $criteria['offset'] ) : 0,
			'post_status'         => 'publish',
			'suppress_filters'    => false,
			'ignore_sticky_posts' => true,
		);
		if ( ! empty( $criteria['author'] ) ) {
			$args['author'] = implode( ",", $criteria['author'] );
		}
		if ( ! empty( $criteria['categories'] ) ) {
			$args['cat'] = implode( ",", $criteria['categories'] );
		}
		if ( ! empty( $criteria['tags'] ) ) {
			$args['tag_in'] = intval( $criteria['tags'] );
		}
		if ( ! empty( $criteria['search'] ) ) {
			$args['s'] = sanitize_text_field( $criteria['search'] );
		}
		return $args;
	}
}

add_action( 'init', 'Newspack_Blocks_Query::init' );
