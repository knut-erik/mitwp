<?php


function optionsHTML() {

    if (!current_user_can('import'))
        wp_die(__('You do not have sufficient permissions of this site.'));

?>
    <!--
        TODO: Get categories from event in WP
        TODO: Display those and add a field to enter UID from labora
        TODO: Enable Remove / Add feature
        TODO: Post / delete - add ..
    -->
    <!-- One Form -->
    <form role="form" method="post" action="admin.php?page=mitwp-options">
        <h2>DO NOT USE</h2>
    </form>


<?php



} //End of optionsHTML
?>
