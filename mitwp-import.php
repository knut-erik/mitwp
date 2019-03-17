<?php
  
/*
 * renderHTML - Render the plugin page for handling import of iCal
 */
function renderHTML() {

    if ( !current_user_can('import') )
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

        
        //Register and enque javascript file
        wp_register_script( 'mitwp_js', plugin_dir_url(__FILE__) . 'ts/mitwp.js');
       
        //Use this to verify ajax from plugin
        $seckey =   CONSTANT('SECURE_AUTH_KEY') . CONSTANT('LOGGED_IN_KEY');
        // Localize javascript
        $mitwp_trans = array(
            'delete' => __( 'DELETE' , 'mitwp' ),
            'a_value' => '10',
            'seckey' => $seckey
        );
        wp_localize_script( 'mitwp_js', 'mitwptrans', $mitwp_trans );
        wp_enqueue_script('mitwp_js', plugin_dir_url(__FILE__) . 'ts/mitwp.js');
       
        wp_register_script('ical_js', plugin_dir_url(__FILE__) . 'js/ical.min.js');
        wp_enqueue_script('ical_js', plugin_dir_url(__FILE__) . 'js/ical.min.js');

        wp_register_style( 'mitwp_css',  plugin_dir_url(__FILE__) . 'css/mitwp.css' );
        wp_enqueue_style( 'mitwp_css');    

    ?>
       <div class="container-fluid">
            <div class="row">
                <div class="col-md-12">
                        <div class="alert alert-success">
                            <strong><?php _e('REST URL : ','mitwp'); echo get_rest_url(); ?>&nbsp;-&nbsp;
                            <?php _e('USER: ','mitwp'); ?>&nbsp;<?php echo wp_get_current_user()->display_name ?></strong>
                        </div>
                </div><!-- col -->
            </div><!-- row -->

            <div id="home_url" style="display: none;"><?php echo get_rest_url() ?></div>
            <div id="wp_user_id" style="display: none;"><?php echo get_current_user_id() ?></div>
            <div id="labora_url" style="display: none;"><?php echo constant('LABORA_URL'); ?></div>
            <div id="labora_url_params" style="display: none;"><?php echo constant('LABORA_URL_PARAMS'); ?></div>

       <!-- ROW -->
        <div class="row">
            <div class="col-md-12">
                    <div class="dropdown pull-left">
                        <button id="btn_choose_category" type="button" onClick="sortList('ul_dropdown_menu')" class="btn btn-primary dropdown-toggle" data-toggle="dropdown"><?php _e('Choose Group','mitwp'); ?>&nbsp;<span class='glyphicon glyphicon-folder-open'></span>&nbsp;&nbsp;<span class="caret"></span></button>
                        <ul class="dropdown-menu" id="ul_dropdown_menu">
                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('GUDSTJENESTE_ICAL_UID'); ?>'
                            , '<?php echo constant('GUDSTJENESTE_BTN_TXT'); ?>')"><?php echo constant('GUDSTJENESTE_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('JESHA_ICAL_UID'); ?>'
                            , '<?php echo constant('JESHA_BTN_TXT'); ?>')"><?php echo constant('JESHA_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('JENTEKVELD_ICAL_UID'); ?>'
                            , '<?php echo constant('JENTEKVELD_BTN_TXT'); ?>')"><?php echo constant('JENTEKVELD_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('ESC_ICAL_UID'); ?>'
                            , '<?php echo constant('ESC_BTN_TXT'); ?>')"><?php echo constant('ESC_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('KONFIRMANT_ICAL_UID'); ?>'
                            , '<?php echo constant('KONFIRMANT_BTN_TXT'); ?>')"><?php echo constant('KONFIRMANT_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('TABAGO_ICAL_UID'); ?>'
                            , '<?php echo constant('TABAGO_BTN_TXT'); ?>')"><?php echo constant('TABAGO_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('BARNEKOR_ICAL_UID'); ?>'
                            , '<?php echo constant('BARNEKOR_BTN_TXT'); ?>')"><?php echo constant('BARNEKOR_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('TREFFEN_ICAL_UID'); ?>'
                            , '<?php echo constant('TREFFEN_BTN_TXT'); ?>')"><?php echo constant('TREFFEN_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('SPRAKKAFE_ICAL_UID'); ?>'
                            , '<?php echo constant('SPRAKKAFE_BTN_TXT'); ?>')"><?php echo constant('SPRAKKAFE_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('SUPERTORSDAG_ICAL_UID'); ?>'
                            , '<?php echo constant('SUPERTORSDAG_BTN_TXT'); ?>')"><?php echo constant('SUPERTORSDAG_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('TANANGERGOSPEL_ICAL_UID'); ?>'
                            , '<?php echo constant('TANANGERGOSPEL_BTN_TXT'); ?>')"><?php echo constant('TANANGERGOSPEL_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('BONNESAMLING_ICAL_UID'); ?>'
                            , '<?php echo constant('BONNESAMLING_BTN_TXT'); ?>')"><?php echo constant('BONNESAMLING_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('SONDAGSSKOLE_ICAL_UID'); ?>'
                            , '<?php echo constant('SONDAGSSKOLE_BTN_TXT'); ?>')"><?php echo constant('SONDAGSSKOLE_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('TORSDAGSLUNSJ_ICAL_UID'); ?>'
                            , '<?php echo constant('TORSDAGSLUNSJ_BTN_TXT'); ?>')"><?php echo constant('TORSDAGSLUNSJ_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('FOLLOWME_ICAL_UID'); ?>'
                            , '<?php echo constant('FOLLOWME_BTN_TXT'); ?>')"><?php echo constant('FOLLOWME_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('BIBELDYKK_ICAL_UID'); ?>'
                            , '<?php echo constant('BIBELDYKK_BTN_TXT'); ?>')"><?php echo constant('BIBELDYKK_BTN_TXT'); ?></a></li>

                            <li><a href="javascript:getiCalFromUrl('<?php echo constant('ARRANGEMENT_ICAL_UID'); ?>'
                            , '<?php echo constant('ARRANGEMENT_BTN_TXT'); ?>')"><?php echo constant('ARRANGEMENT_BTN_TXT'); ?></a></li>
                        </ul><!-- dropdown-menu -->
                    </div><!-- dropdown -->
                <button disabled type="button" id="btn_import" name="btn-start-import" class="btn btn-danger pull-left" onclick="saveImports()"><?php _e('Import','mitwp'); ?>&nbsp;<span class='glyphicon glyphicon-import'></span></button>
            </div> <!-- column -->
        </div><!-- ROW END -->
        <br>
        <!-- ROW -->
        <div class="row">
            <!--  COLUMN -->
            <div class="col-md-12">
                <!-- Place holder for table -->
                <div id="imp_table_placeholder">
                    <div class="table-responsive">
                        <table id="imp_table" class="table table-bordered table-hover">
                            <thead id="imp_table_head">
                                <tr>
                                    <th class="text-center active"><?php _e('Import','mitwp'); ?></th>
                                    <th class="text-center active"><?php _e('Exist','mitwp'); ?></th>
                                    <th class="text-center active"><?php _e('Title','mitwp'); ?></th>
                                    <th class="text-center active"><?php _e('Begins','mitwp'); ?></th>
                                    <th class="text-center active"><?php _e('Ends','mitwp'); ?></th>
                                    <th class="text-center active"><?php _e('Description','mitwp'); ?></th>
                                </tr>
                            </thead>
                            <tbody id="imp_table_body">
                                    <!-- dynamic rows here -->
                            </tbody>
                        </table>
                    </div><!-- table responsive -->
                </div> <!-- div table_placeholder -->
            </div> <!-- COLUMN END -->
        </div> <!-- ROW END END -->
    </div> <!-- container -->
<?php
} //End of renderHTML


?>