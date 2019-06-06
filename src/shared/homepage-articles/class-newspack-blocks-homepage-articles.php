<?php
/**
 * Base class for Newspack homepage blocks server-side rendering
 *
 * @package Newspack_Blocks
 */

/**
 * Server-side rendering for all Newspack homepage articles blocks.
 *
 * @package WordPress
 */
class Newspack_Blocks_Homepage_Articles {

	/**
	 * The block's name (slug)
	 *
	 * @var name
	 **/
	public $name = null;

	/**
	 * Conditionally show the post image
	 *
	 * @var Show Image
	 **/
	public $show_image = false;

	/**
	 * Conditionally show the post excerpt
	 *
	 * @var Show Excerpt
	 **/
	public $show_excerpt = false;

	/**
	 * Conditionally show the post date
	 *
	 * @var Show date
	 **/
	public $show_date = false;

	/**
	 * Conditionally show the post author
	 *
	 * @var Show author
	 **/
	public $show_author = false;

	/**
	 * Conditionally show the post author's avatar
	 *
	 * @var Show avatar
	 **/
	public $show_avatar = false;

	/**
	 * Block attributes
	 *
	 * @var Attributes
	 **/
	public $attributes = array(
		'className'     => array(
			'type' => 'string',
		),
		'content'       => array(
			'type' => 'string',
		),
		'postLayout'    => array(
			'type'    => 'string',
			'default' => 'list',
		),
		'columns'       => array(
			'type'    => 'integer',
			'default' => 3,
		),
		'postsToShow'   => array(
			'type'    => 'integer',
			'default' => 3,
		),
		'mediaPosition' => array(
			'type'    => 'string',
			'default' => 'top',
		),
		'categories'    => array(
			'type' => 'string',
		),
		'typeScale'     => array(
			'type'    => 'integer',
			'default' => 4,
		),
		'imageScale'    => array(
			'type'    => 'integer',
			'default' => 3,
		),
		'sectionHeader' => array(
			'type'    => 'string',
			'default' => '',
		),
	);

	/**
	 * Registers the `newspack-blocks/homepage-articles` block on server.
	 */
	public function register() {
		register_block_type(
			'newspack-blocks/' . $this->name,
			array(
				'attributes'      => $this->attributes,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the `newspack-blocks/author-bio` block on server.
	 *
	 * @param array $attributes The block attributes.
	 *
	 * @return string Returns the post content with latest posts added.
	 */
	public function render( $attributes ) {
		$categories    = isset( $attributes['categories'] ) ? $attributes['categories'] : '';
		$args          = array(
			'posts_per_page'   => $attributes['postsToShow'],
			'post_status'      => 'publish',
			'suppress_filters' => false,
			'cat'              => $categories,
		);
		$article_query = new WP_Query( $args );

		$classes = Newspack_Blocks::block_classes( 'homepage-articles', $this->name, $attributes );

		if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
			$classes .= ' is-grid';
		}
		if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
			$classes .= ' columns-' . $attributes['columns'];
		}
		if ( $this->show_image && isset( $attributes['mediaPosition'] ) && 'top' !== $attributes['mediaPosition'] ) {
			$classes .= ' image-align' . $attributes['mediaPosition'];
		}
		if ( isset( $attributes['typeScale'] ) ) {
			$classes .= ' type-scale' . $attributes['typeScale'];
		}
		if ( $this->show_image && isset( $attributes['imageScale'] ) ) {
			$classes .= ' image-scale' . $attributes['imageScale'];
		}
		if ( isset( $attributes['className'] ) ) {
			$classes .= ' ' . $attributes['className'];
		}

		ob_start();

		if ( $article_query->have_posts() ) :
			?>
			<div class="<?php echo esc_attr( $classes ); ?>">

				<?php if ( '' !== $attributes['sectionHeader'] ) : ?>
					<div class="article-section-title">
						<span><?php echo wp_kses_post( $attributes['sectionHeader'] ); ?></span>
					</div>
					<?php
				endif;
				while ( $article_query->have_posts() ) :
					$article_query->the_post();
					?>
					<article <?php echo has_post_thumbnail() ? 'class="article-has-image"' : ''; ?>>
						<?php if ( has_post_thumbnail() && $this->show_image ) : ?>
							<div class="article-thumbnail">
								<?php the_post_thumbnail( 'large' ); ?>
							</div><!-- .featured-image -->
						<?php endif; ?>

						<div class="article-wrapper">

							<?php the_title( '<h2 class="article-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>

							<?php if ( $this->show_excerpt ) : ?>
								<?php the_excerpt(); ?>
							<?php endif; ?>

							<?php if ( $this->show_author || $this->show_date ) : ?>

								<div class="article-meta">

									<?php if ( $this->show_author ) : ?>
										<?php
										if ( $this->show_avatar ) {
											echo get_avatar( get_the_author_meta( 'ID' ) );
										}
										?>
										<span class="author-name">
											<?php
											printf(
												/* translators: %s: post author. */
												esc_html_x( 'by %s', 'post author', 'newspack-blocks' ),
												'<span class="author vcard"><a class="url fn n" href="' . esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ) . '">' . esc_html( get_the_author() ) . '</a></span>'
											);
											?>
										</span><!-- .author-name -->
										<?php
									endif;

									if ( $this->show_date ) {
										$time_string = '<time class="article-date published updated" datetime="%1$s">%2$s</time>';

										if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) {
											$time_string = '<time class="article-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
										}

										$time_string = sprintf(
											$time_string,
											esc_attr( get_the_date( DATE_W3C ) ),
											esc_html( get_the_date() ),
											esc_attr( get_the_modified_date( DATE_W3C ) ),
											esc_html( get_the_modified_date() )
										);

										echo $time_string; // WPCS: XSS OK.
									}
									?>
								</div><!-- .article-meta -->
							<?php endif; ?>
						</div><!-- .article-wrapper -->
					</article>
					<?php
				endwhile;
				wp_reset_postdata();
				?>
			</div>
			<?php
			endif;
		$content = ob_get_clean();
		Newspack_Blocks::enqueue_view_assets( $this->name );
		return $content;
	}
}

