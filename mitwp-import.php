<?php

/*
 * renderHTML - Render the plugin page for handling import of iCal
 */
function renderHTML() {

    if ( !current_user_can('import') )
        wp_die(__('You do not have sufficient permissions of this site.'));

    //TODO: Evaluate this bullshit ....
    //Get the chosen events
    $chosen = $_REQUEST['chosen'];
    $import_btn = $_REQUEST['start-import-btn'];


    //Register and enque javascript file
    wp_register_script( 'mitwp_js', plugin_dir_url(__FILE__) . 'mitwp.js');
    wp_enqueue_script('mitwp_js', plugin_dir_url(__FILE__) . 'mitwp.js');

    wp_register_script('ical_js', plugin_dir_url(__FILE__) . 'ical.min.js');
    wp_enqueue_script('ical_js', plugin_dir_url(__FILE__) . 'ical.min.js');


    wp_register_style( 'mitwp_css',  plugin_dir_url(__FILE__) . 'mitwp.css' );
    wp_enqueue_style( 'mitwp_css');

    //Styles and scripts (Bootstrap)
    wp_register_style( 'medimp_bootstrap', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' );
    wp_register_style( 'medimp_bootstraptheme', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css' );
    wp_register_script( 'medimp_jquery', '//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js' );
    wp_register_script( 'medimp_bootstrap_js', '//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js' );

    wp_enqueue_style( 'medimp_bootstrap');
    wp_enqueue_style( 'medimp_bootstraptheme');
    wp_enqueue_script( 'medimp_jquery');
    wp_enqueue_script( 'medimp_bootstrap_js');



    ?>

    </br>

    <!-- One Form -->
    <!-- TODO: Evaluate - do I really need the form ? -->
    <form role="form" method="post" action="admin.php?page=mitwp-import">
        <div id="home_url" style="display: block;"><?php echo get_home_url() ?></div>
        <!-- ROW -->
        <div class="row">

            <!-- LEFT COLUMN -->
            <div class="col-sm-4">

                <!-- Panel IMPORT -->
                <div class="panel panel-default">
                    <div class="panel-heading">Mulige grupper for import</div>
                    <div class="panel-body">
                        <div class="form-group">
                            <label for="chosen">Velg gruppe :</label>
                            <select class="form-control" id="chosen" name="chosen">
                                <!-- TODO: Remember to correct this as well - get UIDs as values not the words ! -->
                                <option id='gudstjeneste' value="<?php echo constant('GUDSTJENESTE_ICAL_UID');?>"
                                    <?php echo ($chosen=='gudstjenester' ? 'selected' : '') ?>>Gudstjenester</option>
                                <option id='jesha' value="jesha" <?php echo ($chosen=='jesha' ? 'selected' : '') ?>>Jesha</option>
                                <option id='jentekveld' value="jentekveld" <?php echo ($chosen=='jentekveld' ? 'selected' : '') ?>>Jentekveld</option>
                                <option id='esc' value="esc" <?php echo ($chosen=='esc' ? 'selected' : '') ?>>ESC (Ungdom)</option>
                                <option id='konfirmant' value="konfirmant" <?php echo ($chosen=='konfirmant' ? 'selected' : '') ?>>Konfirmant</option>
                                <option id='tabago' value="tabago" <?php echo ($chosen=='tabago' ? 'selected' : '') ?>>Tabago</option>
                                <option id='barnekor' value="barnekor" <?php echo ($chosen=='barnekor' ? 'selected' : '') ?>>Barnekor</option>
                                <option id='arrangement' value="arrangement" <?php echo ($chosen=='arrangement' ? 'selected' : '') ?>>Arrangementer</option>
                            </select>
                        </div> <!-- Form Group -->
                        <button type="button" id="start-test-btn" name="start-test-btn" class="btn btn-primary"
                                onclick="getiCalFromUrl(chosen.options[chosen.selectedIndex].value)">Hent Data</button>
                        <button type="button" id="start-save-btn" name="start-save-btn" class="btn btn-primary"
                                onclick="saveImports(chosen.options[chosen.selectedIndex].value)">Importer</button>

                    </div> <!-- Panel body end -->
                </div> <!-- Panel IMPORT END -->

            </div> <!-- COLUMN END -->
        </div> <!-- ROW -_>


        <!-- ROW -->
        <div class="row">
            <!--  COLUMN -->
            <div class="col-sm-12">

                <!-- Available imports -->
                <div class="panel panel-primary">
                    <div class="panel-heading">Hendelser som er mulig å importere fra Medarbeideren</div>
                    <div class="panel-body">
                        <!-- Place holder for table -->
                        <div id="imp_table_placeholder">
                            <table id="imp_table" class="table table-bordered table-hover table-responsive">
                                <thead id="imp_table_head">
                                    <tr>
                                        <th class="text-center info">Importere</th class="text-center info">
                                        <th class="text-center info">Eksisterer</th><th class="text-center info">Overskrift</th>
                                        <th class="text-center info">Starter</th><th class="text-center info" info>Slutter</th>
                                        <th class="text-center info">Beskrivelse</th>
                                    </tr>
                                </thead>
                                <tbody id="imp_table_body">
                                        <!-- dynamic rows here -->
                                </tbody>
                            </table>
                        </div>
                    </div> <!-- Panel body end -->
                </div> <!-- Panel END -->

            </div> <!-- COLUMN END -->
        </div> <!-- ROW END END -->

    </form> <!-- Everything in one form -->

    <?php
} //End of renderHTML


?>