<?php
while ( $article_query->have_posts() ) :
    $article_query->the_post();
    if ( ! $attributes['specificMode'] && ( isset( $newspack_blocks_post_id[ get_the_ID() ] ) || $post_counter >= $posts_to_show ) ) {
        continue;
    }
    $newspack_blocks_post_id[ get_the_ID() ] = true;

    $post_counter++;
    ?>

    <?php echo newspack_template_inc(__DIR__ . '/article.php', array(
        'attributes' => $attributes,
    )); ?>

    <?php
endwhile;