<?php
/*
Plugin Name: mitwp
Plugin URI: http://about:none/
Description: Plugin which imports iCal events to WP Events
Version: 0.1
Author: Knut Erik Hollund
Author URI: http://about:none/
License: GPLv3
*/



//Define constants used
define('LABORA_URL', 'https://wsu4.mylabora.com/churchhubrelease/icalhandler.ashx?iCal=');
define('LABORA_URL_PARAMS', '&M=12&pub=true&pubtext=default');

//UIDs for Labora URLS
define('GUDSTJENESTE_ICAL_UID', '8fa0ae2d-2380-400b-9960-a56500bfaf87');


//Require once to load the php code, else it would not be found
require_once( dirname(__FILE__) . '/mitwp-import.php' );
require_once( dirname(__FILE__) . '/mitwp-options.php' );

require_once( dirname(__FILE__) . '/utils.php' );

/* Runs when plugin is activated */
register_activation_hook(__FILE__,'mitwp_install');

/* Runs on plugin deactivation*/
register_deactivation_hook( __FILE__, 'mitwp_remove' );

function mitwp_install() {
    //TODO: Something to do here?
}

function mitwp_remove() {
    //TODO: Something to do here?
}

if (is_admin() ){


    /* Call the code */
    add_action('admin_menu', 'mitwp_admin_menu');

    function mitwp_admin_menu() {
        //add_menu_page( 'MITWP', 'Importere iCal til WP', 'administrator', 'mitwp-import','renderHTML');
        add_menu_page( 'Importere iCal til WP', 'Import - iCal til WP', 'administrator', 'mitwp-import','renderHTML');
        add_submenu_page('mitwp-import', 'Importere iCal til WP - Options', 'Options', 'manage_options', 'mitwp-options', 'optionsHTML');
    }
}

function mitwp_settings_admininit() {
    //TODO: Remove or something to do
    //register_setting( 'myplugin', 'myplugin_setting_1', 'intval' );
    //register_setting( 'myplugin', 'myplugin_setting_2', 'intval' );
}
add_action( 'admin_init', 'mitwp_settings_admininit' );


?>
