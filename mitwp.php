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

//UIDs for Labora URLS
define('GUDSTJENESTE_ICAL_UID', '8fa0ae2d-2380-400b-9960-a56500bfaf87');
define('GUDSTJENESTE_BTN_TXT', __('Gudstjeneste','mitwp'));

define('JESHA_ICAL_UID', 'adaff720-238e-4c70-b093-a5ce012edb92');
define('JESHA_BTN_TXT', __('Jesha','mitwp'));

define('ESC_ICAL_UID', '0894eaa7-ac72-4461-b41a-a5ce0130c621');
define('ESC_BTN_TXT', __('ESC','mitwp'));

define('JENTEKVELD_ICAL_UID', 'fbdaa49d-f23d-452c-ac31-a669012935b9');
define('JENTEKVELD_BTN_TXT', __('Jentekveld','mitwp'));

define('ARRANGEMENT_ICAL_UID', 'b4282c0e-0a1c-472b-be22-a67d016b0ab4');
define('ARRANGEMENT_BTN_TXT', __('Arrangement','mitwp'));

define('BARNEKOR_ICAL_UID', '34c495de-5857-4b70-b435-a5df012ae4a5');
define('BARNEKOR_BTN_TXT', __('Barnekor','mitwp'));

define('TABAGO_ICAL_UID', 'c070e65c-32c4-4599-aa16-a56c015e0beb');
define('TABAGO_BTN_TXT', __('Tabago','mitwp'));

define('KONFIRMANT_ICAL_UID', '06cc98dc-393f-42e7-9046-a5ce0130ef70');
define('KONFIRMANT_BTN_TXT', __('Konfirmant','mitwp'));

define('TREFFEN_ICAL_UID', '81b498db-fc0c-4e03-8f94-a96d0119ed3f');
define('TREFFEN_BTN_TXT', __('Treffen','mitwp'));

define('SPRAKKAFE_ICAL_UID', 'f60f3fa7-5b3b-4daa-9735-a96d0118db47');
define('SPRAKKAFE_BTN_TXT', __('Språkkafé','mitwp'));

define('SUPERTORSDAG_ICAL_UID', 'de069f59-3c68-43a0-a009-a96d011959b2');
define('SUPERTORSDAG_BTN_TXT', __('Supertorsdag','mitwp'));

define('TANANGERGOSPEL_ICAL_UID', '99919cb8-d3d9-4f48-925d-a96d011a23c7');
define('TANANGERGOSPEL_BTN_TXT', __('Tananger Gospel','mitwp'));

define('BONNESAMLING_ICAL_UID', '019f1ea5-222d-4309-8977-a96d011e2f13');
define('BONNESAMLING_BTN_TXT', __('Bønnesamling','mitwp'));

define('TORSDAGSLUNSJ_ICAL_UID', '7cd8e609-171d-4637-983a-a96d0119b853');
define('TORSDAGSLUNSJ_BTN_TXT', __('Torsdagslunsj','mitwp'));

define('SONDAGSSKOLE_ICAL_UID', 'ff23f4d5-c98e-403e-bfe1-a96f013432de');
define('SONDAGSSKOLE_BTN_TXT', __('Søndagsskole','mitwp'));

define('FOLLOWME_ICAL_UID', 'd23ef178-95e0-4eff-aca6-aa13012b858a');
define('FOLLOWME_BTN_TXT', __('FollowMe','mitwp'));

define('BIBELDYKK_ICAL_UID', '02f885db-f5d2-4ec2-89f5-aa13012bbe47');
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
        add_menu_page( __('Import iCal to WP','mitwp'), __('Import iCal to WP','mitwp'), 'administrator', 'mitwp-import','renderHTML');
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
