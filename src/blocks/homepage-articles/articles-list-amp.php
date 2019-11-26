<amp-list
    src="<?php echo esc_url( $articles_rest_url ); ?>"
    layout="responsive"
    width="0"
    height="0"
    binding="refresh"
    load-more="manual"
    load-more-bookmark="next">

    <template type="amp-mustache">
        {{{html}}}
    </template>
    <div fallback>
        <?php
        echo newspack_blocks_template_inc(__DIR__ . '/articles-loop.php', array(
            'attributes'    => $attributes,
            'article_query' => $article_query,
        ) );
        ?>
    </div>
    <amp-list-load-more load-more-failed>
        <p><?php esc_html_e('Unable to load articles at this time.');?></p>
    </amp-list-load-more>

    <?php if ( $attributes['moreButton'] ) : ?>
    <amp-list-load-more load-more-button class="amp-visible">
        <button load-more-clickable><?php _e( 'Load more articles' ); ?></button>
    </amp-list-load-more>
    <?php endif; ?>
</amp-list>