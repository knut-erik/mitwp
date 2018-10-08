<?php
//define( 'WP_DEBUG', true);

/**
* Checking WordPress nonce passed in the header.
* Nonce created on by the plugin. Unique ID for that session only.
*/
function check_seckey(WP_REST_Request $request){

    //Get the securekey passed by from the client
    //Verify the key through the WP function
    $securekey = $request->get_header('mitwp-key');
    $validkey =  ($securekey ==  ( CONSTANT('SECURE_AUTH_KEY') . CONSTANT('LOGGED_IN_KEY') ));

    if($validkey == false){
        $return = Array('error' => 'Not a valid mitwp-key!');
        $return = json_encode($return);
        $response = new WP_REST_Response($return);
        $response->header( 'Access-Control-Allow-Origin', apply_filters( 'giar_access_control_allow_origin', '*' ) );
        $response->set_status(403);
        return $response;
    }

    return $validkey;
}

/**
 * Register the /wp-json/tm/v1 routes
 */
function mitwp_register_routes() {

    register_rest_route( 'mitwp/v1', 'events', array(
        'methods'  => 'GET, POST, DELETE',
        'callback' => 'mitwp_serve_route',
    ) );

    register_rest_route( 'mitwp/v1', 'eventcategories', array(
        'methods'  => 'GET, POST',
        'callback' => 'mitwp_serve_ec_route',
    ) );

}

/**
 * Serve all REST methods and routes accordingly
 */
function mitwp_serve_ec_route(WP_REST_Request $request) {

    $return = null;
    $checkkey = check_seckey($request);

    //If the check returns a WP_REST_Response it's not a valid key.
    if($checkkey instanceof WP_REST_Response){
        return $checkkey;
    }
  
    //GET method
    if($request->get_method()=='GET'){
        
        $return = mitwp_event_get_categories();

    } elseif ($request->get_method()=='POST'){
        
        $return = mitwp_event_edit_categories($request->get_body());
    }

    
    $response = new WP_REST_Response($return);
    $response->header( 'Access-Control-Allow-Origin', apply_filters( 'giar_access_control_allow_origin', '*' ) );

    return $response;
}


/**
 * Serve all REST methods and routes accordingly
 */
function mitwp_serve_route(WP_REST_Request $request) {

    $return = null;
    $checkkey = check_seckey($request);

    //If the check returns a WP_REST_Response it's not a valid key.
    if($checkkey instanceof WP_REST_Response){
        return $checkkey;
    }


    //GET method
    if($request->get_method()=='GET'){
        //Get params needed
        $uid = $request->get_param('uid');
        $event_category = $request->get_param('category');
        $dtstart = $request->get_param('dtstart');

        if( !empty($uid) ){
            //Find it by uid and event_category

            $return = mitwp_event_exists_by_uid($uid, $event_category);
            $return_decoded = json_decode($return,TRUE);

            //Try old posts
            //TODO: This should be REMOVED AFTER A WHIIIILE
            if($return_decoded['found'] == '0'){

                $title = $request->get_param('title');
                $dtstart = $request->get_param('dtstart');
                $dtend = $request->get_param('dtend');
        
                //Check if I can find it by other data - this is only for a limited time
                $return = mitwp_event_exists_by_other($uid, $event_category, $title, $dtstart, $dtend);          
            }                        
        }

    } elseif ($request->get_method()=='POST'){
        
        $return = mitwp_event_import($request->get_body_params());

    }elseif ($request->get_method()=='DELETE'){

        $postid = $request->get_param('postid');
        $event_category = $request->get_param('category');
        $return = mitwp_event_delete($postid, $event_category);
    }

    $response = new WP_REST_Response($return);
    $response->header( 'Access-Control-Allow-Origin', apply_filters( 'giar_access_control_allow_origin', '*' ) );

    return $response;
}

/**
 * Get categories saved as option
 */
function mitwp_event_get_categories() {
    
    $success = false;
    $return = array('success' => $success);

    $categories = Array('id' => 0,  Array('uid' => 'SOMEUID' , 'name' => 'Some category name') );
    $categories = json_encode($categories);
    
    //$newoption = update_option('mitwpcategories', $categories ,true);
    //$categories= get_option('mitwpcategories');
    if($categories){
       $return = $categories;
    }
    $return = json_encode($return);
    return $return;
}
/**
 * Save categories (json) to options.
 * 
 */
function mitwp_event_edit_categories(string $body) {
   
    //TODO: Finish this..
     // Get values from body_params
    $categories = $body;

    $ok = update_option('mitwpcategories', $body ,true);
    $return = array('success' => $ok);    
    $return = json_encode($return);
    return $return;
}

/**
 * Delete wordpress event (post-type = event)
 */
function mitwp_event_delete(string $postid, string $event_category) {
    
    $success = false;
    $success = (!empty($postid) ? wp_delete_post($postid, true) : false);
    $success = ($success ? 'true' : 'false');
    
    $return = array('success' => $success, 'post_id' => $postid);
    $return = json_encode($return);
    
    return $return;
}

/**
 * Import wordpress event (post-type = event)
 */
function mitwp_event_import(array $body_params) {

    // Get values from body_params
    $uid = $body_params['uid'];
    $event_category = $body_params['category'];
    $event_dtend = $body_params['dtend'];
    $event_dtstart = $body_params['dtstart'];
    $event_summary = $body_params['event_summary'];
    $event_description = $body_params['description'];
    $event_utctzoffset = $body_params['utctzoffset'];
    $event_exists = $body_params['exists'];
    $postID = $body_params['post_id'];
    $wpUserID = $body_params['user_id'];


    $tmpDate = new DateTime($event_dtstart,  new DateTimeZone('UTC'));
    $tmpDate->setTimezone(new DateTimeZone('EUROPE/OSLO'));
    $event_dtstart = $tmpDate->format('Y-m-d H:i');

    $tmpDate = new DateTime($event_dtend,  new DateTimeZone('UTC'));
    $tmpDate->setTimezone(new DateTimeZone('EUROPE/OSLO'));
    $event_dtend = $tmpDate->format('Y-m-d H:i');


    //TODO: Check the bullocks with html not intepreted ok
    $my_post = array(
        'ID' => $postID,
        'post_title' => $event_summary,
        'post_content' =>  $event_description,
        'post_status' => 'publish',
        'post_type' => 'event',
        'comment_status' => 'closed',
        'ping_status' => 'closed',
        'post_author' => $wpUserID,
        //'tax_input' => Array( 'event-category' => $event_category ),
        'meta_input' => Array(
            'imic_import_uid' => $uid,
            'imic_event_start_dt' => $event_dtstart,
            'imic_event_end_dt' => $event_dtend,
            'imic_event_frequency_end' => $event_dtend,            
            'imic_featured_event' => 'no',
            'slide_template' => 'default',
            'imic_event_day_month' => 'first',
            'imic_event_week_day' => 'sunday',
            'imic_event_frequency_type' => '0',
            'imic_event_frequency' => '35',
            'imic_sidebar_columns_layout' => '3',
            'imic_event_registration' => '0'
        )
    );
    

    //Prevent mocking with html
    //kses_remove_filters();

    if($event_exists == "true"){
        $postID = wp_update_post($my_post, true);
    } else {
        $postID = wp_insert_post( $my_post, true );
    }

    if (is_wp_error($postID)) {
        $errors = $postID->get_error_messages();
        foreach ($errors as $error) {
            error_log('Update of post failed : ' . $error);
        }
    }

    $term_taxonomy_ids = wp_set_object_terms($postID, $event_category, 'event-category', true);    
    if ( is_wp_error( $term_taxonomy_ids ) ) {
        // There was an error somewhere and the terms couldn't be set.
        foreach ($term_taxonomy_ids as $error) {
            error_log('wp_set_object_terms failed : ' . $error);
        }

    }
    
    //Back to normal filters
    //kses_init_filters();
    $return = array( 'uid' => $uid, 'category' => $event_category);
    $return = json_encode($return);

    return $return;
}

/**
 * Check if Wordpress Event (post-type = event) exists.
 */
function mitwp_event_exists_by_uid(string $uid, string $event_category) {

    //Create a query filter. (Filter on imic_import_uid - key)
    $query = apply_filters( 'giar_get_posts_query', array(
        'numberposts' => -1,
        'post_type'   => 'event',
        'post_status' => 'publish',
            'meta_query'  => array(
                array(         // restrict posts based on meta values
                    'key'     => 'imic_import_uid',  // which meta to query
                    'value'   => $uid,  // value for comparison
                    'compare' => '=',          // method of comparison
                    'type'    => 'TEXT'  )
            ),)
/* TODO: remove paran to search with cateogry. an event can be many cat.
        'tax_query' => array(
                array(
                    'taxonomy'  => 'event-category',
                    'field'     => 'slug',
                    'terms'     => $event_category,
                    'operator'  => 'IN')
                ),)
*/
        );


    $all_posts = get_posts( $query );
    if (!empty($all_posts)){
        //$return[] = array('found' => '1', 'uid' => $uid, 'post_id' => $all_posts[0]->ID);
        $return = array('found' => '1', 'uid' => $uid, 'post_id' => $all_posts[0]->ID);        
    } else {
        //$return[] = array('found' => '0', 'uid' => $uid, 'post_id' => '-1');
        $return = array('found' => '0', 'uid' => $uid, 'post_id' => '-1');        
    }

    $return = json_encode($return);
    return $return;
}

//TODO: This Hack should go away
function mitwp_event_exists_by_other(string $uid, string $event_category,string $title, string $dtstart, string $dtend){


    $key_gps = array('key' => 'imic_event_map_location', 'value' => '58.93535599999999, 5.600313000000028', 'compare' => '=' , 'type' => 'TEXT');

    $tmpStartDate = new DateTime($dtstart,  new DateTimeZone('UTC'));
    $tmpStartDate->setTimezone(new DateTimeZone('EUROPE/OSLO'));
    $dtstart = $tmpStartDate->format('Y-m-d H:i');

    $tmpEndDate = new DateTime($dtend,  new DateTimeZone('UTC'));
    $tmpEndDate->setTimezone(new DateTimeZone('EUROPE/OSLO'));
    $dtend = $tmpEndDate->format('Y-m-d H:i');

    $key_dtstart = array('key' => 'imic_event_start_dt', 'value' => $dtstart, 'compare' => '=', 'type' => 'TEXT');
    $key_dtend = array('key' => 'imic_event_end_dt', 'value' => $dtend, 'compare' => '=' , 'type' => 'TEXT');
  
    //Create a query filter. (Filter on title, dtstart, dtend and gps)
    $query = apply_filters( 'giar_get_posts_query', 
        array(
            'numberposts' => -1,
            'post_title' => $title,
            'post_type'   => 'event',
            'post_status' => 'publish',
            'meta_query'  => array( array( $key_dtstart, $key_dtend, $key_gps) )
            )
        );

    $all_posts = get_posts( $query );
    //$all_posts = new WP_Query( $query );


    if (!empty($all_posts)){

        //Update the wp_postmeta so it contains UID for later use.
        update_post_meta($all_posts[0]->ID,'imic_import_uid',$uid);

        $return = array('found' => '1', 'uid' => $uid, 'post_id' => $all_posts[0]->ID);
        
    } else {        
        $return = array('found' => '0', 'uid' => $uid, 'post_id' => '-1');        
    }

    $return = json_encode($return);
    return $return;
}


/* REST APIS */
add_action( 'rest_api_init', 'mitwp_register_routes' );

?>
