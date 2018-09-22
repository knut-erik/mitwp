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
    wp_enqueue_script('mitwp_js', plugin_dir_url(__FILE__) . 'ts/mitwp.js');

    wp_register_script('ical_js', plugin_dir_url(__FILE__) . 'js/ical.min.js');
    wp_enqueue_script('ical_js', plugin_dir_url(__FILE__) . 'js/ical.min.js');

    wp_register_style( 'mitwp_css',  plugin_dir_url(__FILE__) . 'css/mitwp.css' );
    wp_enqueue_style( 'mitwp_css');


    ?>



       <div class="container-fluid">

            <div class="alert alert-success">
                <strong>HOME URL : <?php echo get_home_url() ?>&nbsp;-&nbsp;USER:&nbsp;<?php echo wp_get_current_user()->display_name ?></strong>
            </div>
           <div id="home_url" style="display: none;"><?php echo get_home_url() ?></div>
           <div id="wp_user_id" style="display: none;"><?php echo get_current_user_id() ?></div>
           <div id="labora_url" style="display: none;"><?php echo constant('LABORA_URL'); ?></div>
           <div id="labora_url_params" style="display: none;"><?php echo constant('LABORA_URL_PARAMS'); ?></div>


       <div class="row">
           <div class="col-md-12">
           <div class="form-group">
               <label for="comment">LOG:</label>
               <textarea readonly class="form-control" rows="5" id="log"></textarea>
           </div>
           </div>
       </div>

       <!-- ROW -->
        <div class="row">
            <!-- LEFT COLUMN -->
            <div class="col-md-2">
                            <div class="dropdown">
                                <button id="btn_choose_category" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown">Velg gruppe for import&nbsp;&nbsp;<span class="caret"></span></button>
                                <ul class="dropdown-menu">
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

                                    <li><a href="javascript:getiCalFromUrl('<?php echo constant('ARRANGEMENT_ICAL_UID'); ?>'
                                    , '<?php echo constant('ARRANGEMENT_BTN_TXT'); ?>')"><?php echo constant('ARRANGEMENT_BTN_TXT'); ?></a></li>
                                </ul><!-- dropdown-menu -->
                            </div><!-- dropdown -->
            </div> <!-- COLUMN END -->
            <div class="col-md-10">
                <button type="button" id="btn_import" name="btn-start-import" class="btn btn-danger" onclick="saveImports()">Importer iCal Data</button>
            </div><!-- COLUMN END -->
        </div><!-- ROW END -->
        <p>&nbsp;</p>
        <!-- ROW -->
        <div class="row">
            <!--  COLUMN -->
            <div class="col-md-12">
                <!-- Place holder for table -->
                <div id="imp_table_placeholder">
                    <table id="imp_table" class="table table-bordered table-hover table-responsive">
                        <thead id="imp_table_head">
                            <tr>
                                <th class="text-center active">Importere</th>
                                <th class="text-center active">Eksisterer</th>
                                <th class="text-center active">Overskrift</th>
                                <th class="text-center active">Starter</th>
                                <th class="text-center active">Slutter</th>
                                <th class="text-center active">Beskrivelse</th>
                            </tr>
                        </thead>
                        <tbody id="imp_table_body">
                                <!-- dynamic rows here -->
                        </tbody>
                    </table>
                </div>

            </div> <!-- COLUMN END -->
        </div> <!-- ROW END END -->
    </div> <!-- container -->
<?php
} //End of renderHTML


?>