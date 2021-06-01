<?php
/**
 * Article template.
 *
 * @global array $attributes Block attributes.
 * @package WordPress
 */

call_user_func(
	function( $data ) {
		$attributes = $data['attributes'];
		$authors    = Newspack_Blocks::prepare_authors();
		$classes    = array();
		$styles     = '';
		$post_id    = get_the_ID();

		// Get sponsors for this post.
		$sponsors = Newspack_Blocks::get_all_sponsors( $post_id );

		// Add classes based on the post's assigned categories and tags.
		$classes[] = Newspack_Blocks::get_term_classes( $post_id );

		// Add class if post has a featured image.
		if ( has_post_thumbnail() ) {
			$classes[] = 'post-has-image';
		}

		// If the post is a sponsor or supporter, it won't have a working permalink, but it might have an external URL.
		$post_link = Newspack_Blocks::get_post_link( $post_id );

		if ( 'behind' === $attributes['mediaPosition'] && $attributes['showImage'] && has_post_thumbnail() ) {
			$styles = 'min-height: ' . $attributes['minHeight'] . 'vh; padding-top: ' . ( $attributes['minHeight'] / 5 ) . 'vh;';
		}
		$image_size = 'newspack-article-block-uncropped';
		if ( has_post_thumbnail() && 'uncropped' !== $attributes['imageShape'] ) {
			$image_size = Newspack_Blocks::image_size_for_orientation( $attributes['imageShape'] );
		}
		$thumbnail_args = '';
		// If the image position is behind, pass the object-fit setting to maintain styles with AMP.
		if ( 'behind' === $attributes['mediaPosition'] ) {
			$thumbnail_args = array( 'object-fit' => 'cover' );
		}
		$category = false;
		// Use Yoast primary category if set.
		if ( class_exists( 'WPSEO_Primary_Term' ) ) {
			$primary_term = new WPSEO_Primary_Term( 'category', $post_id );
			$category_id  = $primary_term->get_primary_term();
			if ( $category_id ) {
				$category = get_term( $category_id );
			}
		}
		if ( ! $category ) {
			$categories_list = get_the_category();
			if ( ! empty( $categories_list ) ) {
				$category = $categories_list[0];
			}
		}

		// Support Newspack Listings hide author/publish date options.
		$hide_author       = apply_filters( 'newspack_listings_hide_author', false ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
		$hide_publish_date = apply_filters( 'newspack_listings_hide_publish_date', false ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound
		$show_author       = $attributes['showAuthor'] && ! $hide_author;
		$show_date         = $attributes['showDate'] && ! $hide_publish_date;
		?>

	<article data-post-id="<?php the_id(); ?>"
		class="<?php echo esc_attr( implode( ' ', $classes ) ); ?>"
		<?php if ( $styles ) : ?>
		style="<?php echo esc_attr( $styles ); ?>"
		<?php endif; ?>
		>
		<?php if ( has_post_thumbnail() && $attributes['showImage'] && $attributes['imageShape'] ) : ?>
			<figure class="post-thumbnail">
				<?php if ( $post_link ) : ?>
				<a href="<?php echo esc_url( $post_link ); ?>" rel="bookmark">
				<?php endif; ?>
					<?php the_post_thumbnail( $image_size, $thumbnail_args ); ?>
				<?php if ( $post_link ) : ?>
				</a>
				<?php endif; ?>

				<?php if ( $attributes['showCaption'] && '' !== get_the_post_thumbnail_caption() ) : ?>
					<figcaption><?php the_post_thumbnail_caption(); ?></figcaption>
				<?php endif; ?>
			</figure><!-- .featured-image -->
		<?php endif; ?>

		<div class="entry-wrapper">
			<?php if ( ! empty( $sponsors ) ) : ?>
				<span class="cat-links sponsor-label">
					<span class="flag">
						<?php echo esc_html( Newspack_Blocks::get_sponsor_label( $sponsors ) ); ?>
					</span>
				</span>
			<?php elseif ( $attributes['showCategory'] && $category ) : ?>
				<div class="cat-links">
					<a href="<?php echo esc_url( get_category_link( $category->term_id ) ); ?>">
						<?php echo esc_html( $category->name ); ?>
					</a>
				</div>
				<?php
			endif;

			if ( '' === $attributes['sectionHeader'] ) :
				// Don't link the title if using the post format aside, or if the post lacks a valid URL.
				if ( has_post_format( 'aside' ) || ! $post_link ) :
					the_title( '<h2 class="entry-title">', '</h2>' );
				else :
					the_title( '<h2 class="entry-title"><a href="' . esc_url( $post_link ) . '" rel="bookmark">', '</a></h2>' );
				endif;
			else :
				// Don't link the title if using the post format aside, or if the post lacks a valid URL.
				if ( has_post_format( 'aside' ) || ! $post_link ) :
					the_title( '<h3 class="entry-title">', '</h3>' );
				else :
					the_title( '<h3 class="entry-title"><a href="' . esc_url( $post_link ) . '" rel="bookmark">', '</a></h3>' );
				endif;
			endif;
			?>
			<?php
			if ( $attributes['showSubtitle'] ) :
				?>
				<div class="newspack-post-subtitle newspack-post-subtitle--in-homepage-block">
					<?php echo esc_html( get_post_meta( $post_id, 'newspack_post_subtitle', true ) ); ?>
				</div>
			<?php endif; ?>
			<?php
			if ( $attributes['showExcerpt'] ) :
				if ( has_post_format( 'aside' ) ) :
					the_content();
				else :
					the_excerpt();
				endif;
			endif;
			if ( ! has_post_format( 'aside' ) && $post_link && ( $attributes['showReadMore'] ) ) :
				?>
				<a class="more-link" href="<?php echo esc_url( $post_link ); ?>" rel="bookmark">
					<?php echo esc_html( $attributes['readMoreLabel'] ); ?>
				</a>
				<?php
			endif;
			if ( $show_author || $show_date || ! empty( $sponsors ) ) :
				?>
				<div class="entry-meta">
					<?php if ( ! empty( $sponsors ) ) : ?>
						<?php
						$logos = Newspack_Blocks::get_sponsor_logos( $sponsors );
						if ( ! empty( $logos ) ) :
							?>
						<span class="sponsor-logos">
							<?php
							foreach ( $logos as $logo ) {
								if ( '' !== $logo['url'] ) {
									echo '<a href="' . esc_url( $logo['url'] ) . '" target="_blank">';
								}
								echo '<img src="' . esc_url( $logo['src'] ) . '" width="' . esc_attr( $logo['width'] ) . '" height="' . esc_attr( $logo['height'] ) . '">';
								if ( '' !== $logo['url'] ) {
									echo '</a>';
								}
							}
							?>
						</span>
					<?php endif; ?>
					<span class="byline sponsor-byline">
						<?php
						$bylines = Newspack_Blocks::get_sponsor_byline( $sponsors );
						echo esc_html( $bylines[0]['byline'] ) . ' ';
						foreach ( $bylines as $byline ) {
							echo '<span class="author">';
							if ( '' !== $byline['url'] ) {
								echo '<a target="_blank" href="' . esc_url( $byline['url'] ) . '">';
							}
							echo esc_html( $byline['name'] );
							if ( '' !== $byline['url'] ) {
								'</a>';
							}
							echo '</span>' . esc_html( $byline['sep'] );
						}
						?>
					</span>
						<?php
					else :
						if ( $show_author ) :
							if ( $attributes['showAvatar'] ) :
								echo wp_kses(
									newspack_blocks_format_avatars( $authors ),
									array(
										'img'      => array(
											'class'  => true,
											'src'    => true,
											'alt'    => true,
											'width'  => true,
											'height' => true,
											'data-*' => true,
											'srcset' => true,
										),
										'noscript' => array(),
										'a'        => array(
											'href' => true,
										),
									)
								);
							endif;
							?>
							<span class="byline">
								<?php echo wp_kses_post( newspack_blocks_format_byline( $authors ) ); ?>
							</span><!-- .author-name -->
							<?php
						endif;
					endif;
					if ( $show_date ) :
						$time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
						if ( get_the_time( 'U' ) !== get_the_modified_time( 'U' ) ) :
							$time_string = '<time class="entry-date published" datetime="%1$s">%2$s</time><time class="updated" datetime="%3$s">%4$s</time>';
						endif;
						printf(
							wp_kses(
								$time_string,
								array(
									'time' => array(
										'class'    => true,
										'datetime' => true,
									),
								)
							),
							esc_attr( get_the_date( DATE_W3C ) ),
							esc_html( get_the_date() ),
							esc_attr( get_the_modified_date( DATE_W3C ) ),
							esc_html( get_the_modified_date() )
						);
					endif;
					?>
				</div><!-- .entry-meta -->
			<?php endif; ?>
		</div><!-- .entry-wrapper -->
	</article>

		<?php
	},
	$data // phpcs:ignore VariableAnalysis.CodeAnalysis.VariableAnalysis.UndefinedVariable
);
