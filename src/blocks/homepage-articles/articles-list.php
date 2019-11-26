<?php
    echo newspack_template_inc(__DIR__ . '/articles-loop.php', array(
        'attributes'    => $attributes,
        'article_query' => $article_query,
    ) );
?>

<button>More Button</button>