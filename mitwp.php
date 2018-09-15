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
//TODO: All this config - move to options page and store it into WP database as plugin configs
define('LABORA_URL', 'https://wsu4.mylabora.com/churchhubrelease/icalhandler.ashx?iCal=');
define('LABORA_URL_PARAMS', '&M=12&pub=true&pubtext=default');

//UIDs for Labora URLS
define('GUDSTJENESTE_ICAL_UID', '8fa0ae2d-2380-400b-9960-a56500bfaf87');
define('GUDSTJENESTE_BTN_TXT', 'Gudstjeneste');

define('JESHA_ICAL_UID', 'adaff720-238e-4c70-b093-a5ce012edb92');
define('JESHA_BTN_TXT', 'Jesha');

define('ESC_ICAL_UID', '0894eaa7-ac72-4461-b41a-a5ce0130c621');
define('ESC_BTN_TXT', 'ESC');

define('JENTEKVELD_ICAL_UID', 'fbdaa49d-f23d-452c-ac31-a669012935b9');
define('JENTEKVELD_BTN_TXT', 'Jentekveld');

define('ARRANGEMENT_ICAL_UID', 'b4282c0e-0a1c-472b-be22-a67d016b0ab4');
define('ARRANGEMENT_BTN_TXT', 'Arrangement');

define('BARNEKOR_ICAL_UID', '34c495de-5857-4b70-b435-a5df012ae4a5');
define('BARNEKOR_BTN_TXT', 'Barnekor');

define('TABAGO_ICAL_UID', 'c070e65c-32c4-4599-aa16-a56c015e0beb');
define('TABAGO_BTN_TXT', 'Tabago');

define('KONFIRMANT_ICAL_UID', '06cc98dc-393f-42e7-9046-a5ce0130ef70');
define('KONFIRMANT_BTN_TXT', 'Konfirmant');

define('EVENT_MAP_LOCATION', 'Tananger kirke, Sola, Norway');
define('EVENT_LOCATION_GPS', '58.93535599999999, 5.600313000000028');



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
