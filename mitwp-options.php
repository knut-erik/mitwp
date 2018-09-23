<?php


function optionsHTML() {

    if (!current_user_can('import'))
        wp_die(__('You do not have sufficient permissions of this site.'));
    

    /* Bootstrap */
    //Styles and scripts (Bootstrap)
    wp_register_style( 'medimp_bootstrap', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' );
    wp_register_style( 'medimp_bootstraptheme', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css' );
    wp_register_script( 'medimp_jquery', '//ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js' );
    wp_register_script( 'medimp_bootstrap_js', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js' );


    wp_enqueue_style( 'medimp_bootstrap');
    wp_enqueue_style( 'medimp_bootstraptheme');
    wp_enqueue_script( 'medimp_jquery');
    wp_enqueue_script( 'medimp_bootstrap_js');


?>
    <!--
        TODO: Get categories from event in WP
        TODO: Display those and add a field to enter UID from labora
        TODO: Enable Remove / Add feature
        TODO: Post / delete - add ..
    -->
    <div class="container-fluid">
        <div class="alert alert-success">
            <strong><?php _e('HOME URL : ','mitwp'); echo get_home_url(); ?>&nbsp;-&nbsp;<?php _e('USER: ','mitwp'); ?>&nbsp;<?php echo wp_get_current_user()->display_name ?></strong>
        </div>
        <p>Not in use - for the future.</p>
    </div>


<?php

} //optionsHTML

?>