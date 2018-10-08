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

    //Use this to verify ajax from plugin
    $seckey =   CONSTANT('SECURE_AUTH_KEY') . CONSTANT('LOGGED_IN_KEY');
    $resturl = get_rest_url();
    wp_register_script( 'mitwp_options_js', plugin_dir_url(__FILE__) . 'ts/mitwp_options.js');
    $mitwp_option_trans = array(
        'seckey' => $seckey,
        'apiurl' => $resturl
    );
    wp_localize_script( 'mitwp_options_js', 'mitwpoptiontrans', $mitwp_option_trans );
    wp_enqueue_script('mitwp_options_js', plugin_dir_url(__FILE__) . 'ts/mitwp_options.js');
       

?>
    <!--
        TODO: Get categories from event in WP
        TODO: Display those and add a field to enter UID from labora
        TODO: Enable Remove / Add feature
        TODO: Post / delete - add ..
    -->
    <div class="container-fluid">
        <div class="alert alert-success">
            <strong><?php _e('REST URL : ','mitwp'); echo $resturl; ?>&nbsp;-&nbsp;<?php _e('USER: ','mitwp'); ?>
            &nbsp;<?php echo wp_get_current_user()->display_name ?></strong>
        </div>
        
        <p>Not in use - for the future.</p>
        <!-- <button onClick="getCategories();">TEST</button> -->

    </div>
    

<?php

} //optionsHTML

?>