//Import jquery TS
import * as jQuery from 'jquery';

//TODO: Get ICAL as a module for TypeScript
let ICAL : any;

//Contains translated strings fired off at the wp side
//Transferd as this variable
let mitwptrans : any;

/**
 * Disable a button with the corresponding buttonID.
 * 
 * @param {string} [info] - Text which should be logged to the <div id='log'>
 */
function log_info(info : string){

    let textArea = $("#log");    
    let logText = textArea.val();
    let nowstr = '[' + new Date().toLocaleString() + ']';

    logText += '\r\n' + nowstr + '[ ' + info + ' ]';
    if (logText) {textArea.val(logText);}
    textArea.scrollTop(textArea[0].scrollHeight);
}

/**
 * Return url to REST API
 * 
 * @param {string} [info] - Text which should be logged to the <div id='log'>
 * @returns {string} - The url to the REST API
 */
function get_api_url() : string {
    
    let apiurl = $("#home_url").text();
    apiurl += "/wp-json/tm/v1/events/";
    return apiurl;
}

/**
 * Disable a button with the corresponding buttonID.
 * 
 * @param {string} [buttonID] - ID of button to disable
 * @param {boolean} [disable] - Disable the button?
 */
function disableButton(buttonID : string, disable : boolean) {

    $("#" + buttonID).prop('disabled', disable);
}

/**
 * Use Labora's UID for retreiving iCal file.
 * 
 * @param {string} [urlUID] - UID from Labora.
 * @param {string} [category] - Category in Labora which is retrieved.
 */
function getiCalFromUrl(urlUID : string, category : string){

    //Get URL to Labora's UID getter and add parameters
    let laboraUrl = $("#labora_url").text();
    laboraUrl += urlUID;
    laboraUrl += $("#labora_url_params").text();

    log_info('Get iCal from URL : ' + laboraUrl);

    //lowercase the category to fit
    category = category.toLowerCase();
    log_info('Retrieving category : ' + category);

    disableButton("btn_choose_category",true);
    disableButton("btn_import",true);

    //update table with data
    jQuery.get(laboraUrl, function(iCalAsString : string, status : string){
        log_info('HTTP Response from labora iCal URL => ' + status);
        updateTable(iCalAsString, category);
        disableButton("btn_choose_category",false);
        disableButton("btn_import",false);
    });

}

/**
 * Delete Post from Wordpress
 * 
 * @param {string} [rowuid] - Unique EVENT UID from the iCal file.
 */
function deleteFromWP(rowuid : string){
    
    let restapi = get_api_url();
    let postid = $("#imp_wpid_"+rowuid).text();
    let category = $("#imp_data_category_"+rowuid+ " span").text();

    //log_info(postid);
    restapi += "?postid=" + postid + "&category="+category;
    
    $.ajax({
        url: restapi,
        type: 'DELETE'        
        ,
        success: function(result) {
            // Do something with the result
            result = JSON.parse(result);
            if(result.success='true'){
                log_info('Post_id [' + result.post_id + '] Deleted - [' + result.success+ ']');

                //Disable Delete button, background on row, wp post_id to empty
                //disableButton("delete_wpid_" + rowuid, true);
                //$('#row_' + rowuid ).prop('class', '');
                setExistingCheckbox(Array(rowuid), category);

            }else{
                log_info('Could not delete? - DELETE returned ' + result.success + ' for Post ' + result.post_id);
            }            
        },
        error: function() {
            // Do something with the result
            log_info('ERROR - REST API did not receive success - post id => ' + postid);
        }

    });
    
    //remove id form div tabg
    //remove success
    //disable delete button

}

/**
 * Save all marked rows for import.
 */
function saveImports(){

    let apiurl = get_api_url();

    //run through each row - Slice will select form 0 to the end.
    let rows = $("tbody#imp_table_body tr").slice(0);    

    //Loop through and save those which triggers - importornot
    for(let i=0; i<rows.length;i++){

        //Slice to get the uid
        let rowUid = rows[i]['id'].slice(4);

        let importOrNot = $("#import_"+rowUid).is(':checked');
        let existsOrNot = $("#exists_"+rowUid).is(':checked');
        let rowSummary = $("#imp_summary_"+rowUid+ " span").text();
        let rowCategory = $("#imp_data_category_"+rowUid+ " span").text();
        let rowDescription = $("#imp_description_"+rowUid+ " span").html();
        let rowdtStart = $("#imp_dtstart_utc_"+rowUid).text();
        let rowdtEnd = $("#imp_dtend_utc_"+rowUid).text();
        let rowUTCTZOffset = $("#imp_utctzoffset_"+rowUid).text();
        let postID = $("#imp_wpid_"+rowUid).text();
        let wpUserID = $("#wp_user_id").text();

        let post_data = {
            uid: rowUid,
            category: rowCategory,
            dtstart : rowdtStart,
            dtend : rowdtEnd,
            description : rowDescription,
            event_summary : rowSummary,
            utctzoffset : rowUTCTZOffset,
            post_id : postID,
            user_id : wpUserID,
            exists : existsOrNot
        };


        if(importOrNot){
            log_info('IMPORTING TO WP : ' + post_data.event_summary+' - ' 
                + new Date(post_data.dtstart).toLocaleString() +' - ' 
                + new Date(post_data.dtend).toLocaleString());

            //Fire off a post (REST API) insert/update data
            jQuery.post(apiurl, post_data, function(data, status){
                //Disable buttons
                disableButton("btn_choose_category",true);
                disableButton("btn_import",true);

                //Parse string to JSON object
                data = JSON.parse(data);

                //Set exists checkbox and enable buttons
                setExistingCheckbox( Array(data.uid), data.category);
                disableButton("btn_choose_category",false);
                disableButton("btn_import",false);
            },'json');
        }
    }//End loop
}

/**
 * Update the HTML table with new data.
 * Clear table first (.empty()) and fill up.
 * 
 * @param {string} [iCalAsString] - iCal file retreived from labora.
 * @param {string} [category] - Category of retrieved iCal.
 */
function updateTable(iCalAsString : string, category : string){

    log_info('Updating table with Category => ' + category);
    let $place_holder = $("tbody#imp_table_body");

    //Clear the table body
    $("tbody#imp_table_body").empty();

    let result = getICalTable(iCalAsString, category);
    let uids = result[0];
    let tableDOM = $.parseHTML(result[1]);

    //Append the new DOM - table content
    $place_holder.append(tableDOM);

    setExistingCheckbox(uids, category);
}


/**
 * Returns a HTML table with data from iCal file. 
 * 
 * @param {string} [iCalAsString] - iCal file retreived from labora.
 * @param {string} [category] - Category of retrieved iCal.
 * @returns {string[string[],string]} - Returns an array consist of arrays of UIDs and the HTML code.
 */
function getICalTable(iCalAsString : string, category : string): [string[], string] {

    disableButton("btn_choose_category",true);
    disableButton("btn_import",true);

    //Get the iCal Data
    let jcalData = ICAL.parse(iCalAsString);
    let vcalendar = new ICAL.Component(jcalData);    
    let allSubComponents = vcalendar.getAllSubcomponents('vevent');

    //Sort events
    //Sorting by using DTSTART time (parsing)
    //FIXME: Jikes ... this is fragile
    allSubComponents.sort(
        function(a : Object [] ,b : Object []){

            //convert to string
            let eventa = a.toString();
            let eventb = b.toString();

            //DTSTART;TZID=W. Europe Standard Time:20181005T180000
            //LOCATION
            let toindex = eventa.indexOf(":", eventa.indexOf("DTSTART;"));
            let firstDateAsNumber = eventa.substring(toindex+1,toindex+9);

            toindex = eventb.indexOf(":", eventb.indexOf("DTSTART;"));
            let secondDateAsNumber = eventb.substring(toindex+1,toindex+9);
            
            return (firstDateAsNumber>secondDateAsNumber);
        }
    );

    let tblHTML = "";
    let uids : any = [];  //TODO: FORDI JEG IKKE HAR ICAL DEFENISJONEN

    //Loop through subcomponents
    for (let i=0; i<allSubComponents.length; i++) {
        let summary = allSubComponents[i].getFirstPropertyValue('summary');
        let description = allSubComponents[i].getFirstPropertyValue('description');
        let dtstart = allSubComponents[i].getFirstPropertyValue('dtstart');
        let dtend = allSubComponents[i].getFirstPropertyValue('dtend');
        let uid = allSubComponents[i].getFirstPropertyValue('uid');
        
        //TODO: Any other way to do this?
        uids.push(uid);

        //Empty strings instead of null
        if( description == null){
            description = "";
        }
        if( summary == null){
            summary = "";
        }
    
        let oneRow =  "<tr id='row_" + uid + "' >";
        let tblColumn = "<td id='imp_import' class='text-center'><input id='import_" + uid + "' type='checkbox' /></td>";
        
        tblColumn += "<td id='imp_exists' class='text-center'><span id='imp_exists_icon_" +uid+"' class=''></span>&nbsp;";
        tblColumn += "<input style='opacity: 0;' id='exists_" + uid + "' type='radio' disabled readOnly />";

        tblColumn += "&nbsp;&nbsp;<button id='delete_wpid_" + uid + "' onclick='deleteFromWP(\"" + uid + "\")' class='btn btn-danger' disabled>" + mitwptrans.delete + "</td>";

        tblColumn += "<td id='imp_summary_"+uid +"'><span>"+summary+"</span></td>";
        tblColumn += "<td id='imp_dtstart_"+uid +"' class='text-center'><span>"+new Date(dtstart).toLocaleString()+"</span></td>";
        tblColumn += "<td id='imp_dtend' class='text-center'><span id='span_dtend'>"+new Date(dtend).toLocaleString()+"</span></td>";
        tblColumn += "<td id='imp_description_"+uid +"'><span>"+description+"</span></td>";

        //Hidden TDs
        tblColumn += "<td id='imp_data_uid' style='display: none;'>" + uid +"</td>";
        tblColumn += "<td id='imp_dtstart_utc_"+uid +"' style='display: none;'>" + new Date(dtstart).toUTCString() +"</td>";
        tblColumn += "<td id='imp_dtend_utc_"+ uid +"' style='display: none;'>" + new Date(dtend).toUTCString() +"</td>";
        tblColumn += "<td id='imp_utctzoffset_"+ uid +"' style='display: none;'>" + new Date(dtstart).getTimezoneOffset() +"</td>";
        tblColumn += "<td id='imp_wpid_"+ uid +"' style='display: none;'></td>";
        tblColumn += "<td id='imp_data_category_"+uid +"' style='display: none;'><span>" + category +"</span></td>";

        oneRow += tblColumn;
        tblHTML += oneRow  +"</tr>";
    }

    disableButton("btn_choose_category",false);
    disableButton("btn_import",false);

    return [uids,tblHTML];
}

/**
 * Set checkboxes to marked if the rows exists in Wordpress as a post of type Event.
 * 
 * @param {string[]} [uids] - Array of strings which holds the UIDs from the iCal.
 * @param {string} [category] - Category of retrieved iCal.
 */
function setExistingCheckbox(uids : string[], category : string){

    let apiurl = get_api_url();    

    disableButton("btn_choose_category",true);
    disableButton("btn_import",true);

    log_info('Check if posts exists in WP - if so mark the rows');
    for(let i=0;i < uids.length;i++){
        
            let gylphicon = 'glyphicon ';
            let restapi = apiurl + "?uid=" + uids[i] +"&category=" + category;

            //Call the REST API
            jQuery.get(restapi, function(data, status){

                //Parse JSON string into object
                data = JSON.parse(data);

                disableButton("btn_choose_category",true);
                disableButton("btn_import",true);        
    
                let chkExists = false;
                if( parseInt(data.found) == 1){
                        chkExists = true;
                        gylphicon += 'glyphicon-thumbs-up';
                        $('#row_' + data.uid ).prop('class', 'success');
                        $('#imp_wpid_' + data.uid ).text(data.post_id);

                }else{
                        //Clear the success flag and the Wordpress Post ID
                        $('#row_' + data.uid).prop('class', '');
                        $('#imp_wpid_' + data.uid).text('');
                        gylphicon += 'glyphicon-thumbs-down';
                }
            $('#exists_' + data.uid ).prop('checked', chkExists);
            $('#imp_exists_icon_' + data.uid ).prop('class', gylphicon);
            disableButton("delete_wpid_" + data.uid,!chkExists);
            $('#import_' + data.uid ).prop('checked', !chkExists); //Enable import because it doesn't exist

            
            disableButton("btn_choose_category",false);
            disableButton("btn_import",false);
        });
    }

}