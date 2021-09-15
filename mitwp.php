<?php
/*
Plugin Name: mitwp
Description: Plugin which imports iCal events to WP Events
Version: 0.10
Author: Knut Erik Hollund
Text Domain: mitwp
Domain Path: /lang
License: GPLv3
*/


//Define constants used
//TODO: All this config - move to options page and store it into WP database as plugin configs
define('LABORA_URL', 'https://wsu4.mylabora.com/churchhubrelease/icalhandler.ashx?iCal=');
define('LABORA_URL_PARAMS', '&M=12&pub=true&pubtext=default');

define('GUDSTJENESTE_ICAL_UID', '8fa0ae2d-2380-400b-9960-a56500bfaf87');
define('GUDSTJENESTE_BTN_TXT', __('Gudstjeneste','mitwp'));

define('JESHA_ICAL_UID', '53d26c4d76294056b183ada2010a7e64');
define('JESHA_BTN_TXT', __('Jesha','mitwp'));

define('ENTER_ICAL_UID', '40329340001a4c0ea332ada20109c28a');
define('ENTER_BTN_TXT', __('Enter','mitwp'));

define('JENTEKVELD_ICAL_UID', '1f780e0ce16048dab281ada2010a4e18');
define('JENTEKVELD_BTN_TXT', __('Jentekveld','mitwp'));

define('ARRANGEMENT_ICAL_UID', '04a33e8c840d42599a19ada2010da2ea');
define('ARRANGEMENT_BTN_TXT', __('Arrangement','mitwp'));

define('BARNEKOR_ICAL_UID', 'c1e15333b3e640199ec4ada20106c62d');
define('BARNEKOR_BTN_TXT', __('Barnekor','mitwp'));

define('TROSOPPLAERING_ICAL_UID', '7bed09737946479aba77ada2010bfe54');
define('TROSOPPLAERING_BTN_TXT', __('Trosopplæring','mitwp'));

define('KONFIRMANT_ICAL_UID', '48823ca504544f10bf08ada2010ab8b7');
define('KONFIRMANT_BTN_TXT', __('Konfirmant','mitwp'));

define('TREFFEN_ICAL_UID', '1c4ce612abf84679b37eada2010bc92c');
define('TREFFEN_BTN_TXT', __('Treffen','mitwp'));

define('SPRAKKAFE_ICAL_UID', 'd95ebc82a0f749238ee0ada2010b0616');
define('SPRAKKAFE_BTN_TXT', __('Språkkafé','mitwp'));

define('SUPERTORSDAG_ICAL_UID', '02a0f3b750374901975eada2010b424d');
define('SUPERTORSDAG_BTN_TXT', __('Supertorsdag','mitwp'));

define('TANANGERGOSPEL_ICAL_UID', '1636ce36358a418baabfada2010b8ce6');
define('TANANGERGOSPEL_BTN_TXT', __('Tananger Gospel','mitwp'));

define('BONNESAMLING_ICAL_UID', 'ad23a5391c854e12b25eada201091abe');
define('BONNESAMLING_BTN_TXT', __('Bønnesamling','mitwp'));

define('TORSDAGSLUNSJ_ICAL_UID', 'af93a23e295746b2a5d5ada2010bac3e');
define('TORSDAGSLUNSJ_BTN_TXT', __('Torsdagslunsj','mitwp'));

define('SONDAGSSKOLE_ICAL_UID', '278be323431849f7bcbeada2010b672f');
define('SONDAGSSKOLE_BTN_TXT', __('Søndagsskole','mitwp'));

define('FOLLOWME_ICAL_UID', '686fd57cef794bd7a86eada30163bea1');
define('FOLLOWME_BTN_TXT', __('FollowMe','mitwp'));

define('BIBELDYKK_ICAL_UID', '3556e40f3b2140e4b6acada2010652c8');
define('BIBELDYKK_BTN_TXT', __('Bibeldykk','mitwp'));

//Require once to load the php code, else it would not be found
require_once( dirname(__FILE__) . '/mitwp-import.php' );
require_once( dirname(__FILE__) . '/mitwp-options.php' );
require_once( dirname(__FILE__) . '/api/mitwpapi.php');

require_once( dirname(__FILE__) . '/utils.php' );

/* Runs when plugin is activated */
register_activation_hook(__FILE__,'mitwp_install');

/* Runs on plugin deactivation*/
register_deactivation_hook( __FILE__, 'mitwp_remove' );

add_action( 'init', 'mitwp_load_textdomain' );
/**
 * Load plugin textdomain.
 */
function mitwp_load_textdomain() {
  load_plugin_textdomain( 'mitwp', false, dirname( plugin_basename( __FILE__ ) ) . '/lang' );

}

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
        add_menu_page( __('Import iCal to WP','mitwp'), __('Import iCal to WP','mitwp'), 'edit_posts', 'mitwp-import','renderHTML');
        add_submenu_page('mitwp-import', __('Import iCal to WP - Options','mitwp'), __('Options','mitwp'), 'manage_options', 'mitwp-options', 'optionsHTML');
    }
}

function mitwp_settings_admininit() {
    //TODO: Remove or something to do
    //register_setting( 'myplugin', 'myplugin_setting_1', 'intval' );
    //register_setting( 'myplugin', 'myplugin_setting_2', 'intval' );
}
add_action( 'admin_init', 'mitwp_settings_admininit' );


?>
