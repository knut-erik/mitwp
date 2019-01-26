//Import jquery TS
import * as jQuery from 'jquery';

//TODO: Get ICAL as a module for TypeScript
let ICAL: any;

//Contains translated strings or other useful data.
//Fire off by WP wp_localize_script
let mitwptrans: any;


/**
 * Logging info to the console log.
 * 
 * @param {string} [info] - Text which should be logged to console.log
 */
function logInfo(info: string){

    let nowstr: string = '[' + new Date().toLocaleString() + ']';
    let logText: string = '\r\n' + (nowstr ? nowstr : '') + '[ ' + (info ? info : '') + ' ]';
    if (logText) {
        console.log(logText);
    }
}

/**
 * Get security-key to pass 
 * as header when doing ajax
 * @returns {string} - Security key
 */
function getSecKey(): string {
    return mitwptrans.seckey;
}

/**
 * Return request header used for security key.
 * @returns {string} - Key to use
 */
function getSecRequestHeader(): string {
    return 'mitwp-key';
}


/**
 * Used for sorting a list within the bootstrap combobox
 * @param id - id of <li> elements to sort
 */
function sortList(id: string) {
        
    let html: any = $("#" + id);
    let htmlLi: any = $("#" + id + " li");
    
    let sorted = htmlLi.sort(
                function (a, b) { return a.innerText == b.innerText ? 0 : a.innerText < b.innerText ? -1 : 1 }
    );
        
    html.html(sorted);    
}

/**
 * Disable a button with the corresponding buttonID.
 * 
 * @param {string} [html] - HTML code which should be decoded to plain text.
 * @param {string} - Clean text without HTML or any markup code.
 */
function parseHTML(html: string): string {
    var parser = new DOMParser;

    //replace </p> and <br> with linebreaks
    var regp: RegExp = new RegExp('</p>', 'g');
    var regbr: RegExp = new RegExp('<br>', 'g');    
    html = html.replace(regp ,"</p>\n");
    html = html.replace(regbr ,"<br>\n");

    var dom = parser.parseFromString(html, 'text/html');
    var decodedString: string = (dom.body.textContent!=null ? dom.body.textContent : '');
    
    return decodedString;    
}

/**
 * Return url to REST API
 * @returns {string} - The url to the REST API
 */
function getApiUrl(): string {
    
    let apiurl : string = $("#home_url").text();
    apiurl += "mitwp/v1/events/";    
    return apiurl;
}

/**
 * Disable a button with the corresponding buttonID.
 * 
 * @param {string} [buttonID] - ID of button to disable
 * @param {boolean} [disable] - Disable the button?
 */
function disableButton(buttonID: string, disable: boolean) {

    $("#" + buttonID).prop('disabled', disable);
}

/**
 * Use Labora's UID for retreiving iCal file.
 * 
 * @param {string} [urlUID] - UID from Labora.
 * @param {string} [category] - Category in Labora which is retrieved.
 */
function getiCalFromUrl(urlUID: string, category: string){

    //Get URL to Labora's UID getter and add parameters
    let laboraUrl: string = $("#labora_url").text();
    laboraUrl += urlUID;
    laboraUrl += $("#labora_url_params").text();

    logInfo('Get iCal from URL : ' + laboraUrl);

    //lowercase the category to fit
    category = category.toLowerCase();
    logInfo('Retrieving category : ' + category);

    disableButton("btn_choose_category",true);
    disableButton("btn_import",true);

    //update table with data
    jQuery.get(laboraUrl, function(iCalAsString : string, status : string){
        logInfo('HTTP Response from labora iCal URL => ' + status);
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
function deleteFromWP(rowuid: string){
    
    let restapi: string = getApiUrl();
    let postid: string = $("#imp_wpid_"+rowuid).text();
    let category: string = $("#imp_data_category_"+rowuid+ " span").text();

    restapi += "?postid=" + postid + "&category=" + category;  
    $.ajax({
        url: restapi,
        type: 'DELETE',
        beforeSend: function(xhr){
            xhr.setRequestHeader(getSecRequestHeader(), getSecKey());
        },       
        success: function(result) {
            // Do something with the result
            result = JSON.parse(result);
            if(result.success='true'){
                logInfo('Post_id [' + result.post_id + '] Deleted - [' + result.success+ ']');
                //Disable Delete button, background on row, wp post_id to empty
                setExistingCheckbox(Array(rowuid), category);
            }else{
                logInfo('Could not delete? - DELETE returned ' + result.success + ' for Post ' + result.post_id);
            }            
        },
        error: function() {
            // Do something with the result
            logInfo('ERROR - REST API did not receive success - post id => ' + postid);
        }

    });
    
}

/**
 * Save all marked rows for import.
 */
function saveImports(){

    let apiurl: string= getApiUrl();

    //Run through each row, slice will select form 0 to the end.
    let rows = $("tbody#imp_table_body tr").slice(0);    

    //Loop through and save those which triggers - importornot
    for(let i=0; i<rows.length;i++){

        //Slice to get the uid
        let rowUid = rows[i]['id'].slice(4);

        let importOrNot = $("#import_"+rowUid).is(':checked');
        let existsOrNot = $("#exists_"+rowUid).is(':checked');
        let rowSummary : string= $("#imp_summary_"+rowUid+ " span").text();
        let rowCategory : string = $("#imp_data_category_"+rowUid+ " span").text();
        let rowDescription : string = $("#imp_description_"+rowUid+ " span").html();

        //Remove HTML code
        rowDescription = parseHTML(rowDescription);

        let rowdtStart : string = $("#imp_dtstart_utc_"+rowUid).text();
        let rowdtEnd : string = $("#imp_dtend_utc_"+rowUid).text();
        let rowUTCTZOffset : string = $("#imp_utctzoffset_"+rowUid).text();
        let postID : string = $("#imp_wpid_"+rowUid).text();
        let wpUserID : string = $("#wp_user_id").text();

        let postdata = {
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
            logInfo('IMPORTING TO WP : ' + postdata.event_summary+' - ' 
                + new Date(postdata.dtstart).toLocaleString() +' - ' 
                + new Date(postdata.dtend).toLocaleString());
                    $.ajax({
                            url: apiurl,
                            data: postdata,
                            method: 'POST',
                            //crossDomain: true,
                            //xhrFields:{withCredentials: true},
                            beforeSend: function(xhr){
                                xhr.setRequestHeader(getSecRequestHeader(), getSecKey());
                            },
                            success: function(data){
                                //Disable buttons
                                disableButton("btn_choose_category",true);
                                disableButton("btn_import",true);
                
                                //Parse string to JSON object
                                data = JSON.parse(data);
                
                                //Set exists checkbox and enable buttons
                                setExistingCheckbox( Array(data.uid), data.category);
                                disableButton("btn_choose_category",false);
                                disableButton("btn_import",false);
                        },
                        error: function(jqXHR, status, errorthrown ){ 
                            logInfo(status + ' - ' + errorthrown + ' - ' + jqXHR.responseText); 
                        }
                    });
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
function updateTable(iCalAsString: string, category: string){

    logInfo('Updating table with Category => ' + category);
    let $place_holder = $("tbody#imp_table_body");

    //Clear the table body
    $("tbody#imp_table_body").empty();

    //let icaltable: ICalTable = getICalTable(iCalAsString, category);
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
function getICalTable(iCalAsString: string, category: string): [string[], string] {

    disableButton("btn_choose_category",true);
    disableButton("btn_import",true);

    //Get the iCal Data
    let jcalData = ICAL.parse(iCalAsString);
    let vcalendar = new ICAL.Component(jcalData);    
    let allSubComponents = vcalendar.getAllSubcomponents('vevent');

    //Sort events
    allSubComponents.sort(
        function(a: Object [] ,b: Object []){
            //Use iCals EVENT DTSTART property for comparing
            //The start date of an event.
            let dtstart_a = (<any>a).getFirstPropertyValue('dtstart');
            let dtstart_b = (<any>b).getFirstPropertyValue('dtstart');

            let date_a: Date = new Date(dtstart_a);
            let date_b: Date = new Date(dtstart_b);
            
            //Convert time to numbers
            let testa: number = Math.round(date_a.getTime()/1000);
            let testb: number = Math.round(date_b.getTime()/1000);

            return (testa - testb);
        }
    );

    let tblHTML: string = "";
    let uids: string[] = [];  //TODO: Do this in typescript, due to no types/ical definision module.

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
function setExistingCheckbox(uids: string[], category: string){

    let apiurl = getApiUrl();    

    disableButton("btn_choose_category",true);
    disableButton("btn_import",true);

    logInfo('Check if posts exists in WP - if so mark the rows');
    for(let i=0;i < uids.length;i++){

            let gylphicon = 'glyphicon ';
            let summary = $("#imp_summary_"+uids[i]+ " span").text();
            let dtstart = $("#imp_dtstart_utc_"+uids[i]).text();
            let dtend = $("#imp_dtend_utc_"+uids[i]).text();    
            let restapi = apiurl + "?uid=" + uids[i] +"&category=" + category + "&dtstart="+ dtstart + "&dtend=" + dtend + "&title="+summary;
            
            
            //Call the REST API
            $.ajax({
                url: restapi,
                method: 'GET',
                contentType: 'application/json',
                //crossDomain: true,
               // xhrFields:{withCredentials: true},
                beforeSend: function(xhr){
                    xhr.setRequestHeader(getSecRequestHeader(), getSecKey());
                },
                success: function(data){

                    logInfo('Status from REST API : ' + status);
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
                    //Enable import because it doesn't exist
                    $('#import_' + data.uid ).prop('checked', !chkExists); 
                    
                    disableButton("btn_choose_category",false);
                    disableButton("btn_import",false);    

                },
                error: function(jqXHR, status, errorthrown ){ 
                    logInfo(status + ' - ' + errorthrown + ' - ' + jqXHR.responseText); 
                }
            })
    }
}