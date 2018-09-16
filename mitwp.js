
function log_info(info){

    let textArea = $("#log");
    let logText = textArea.val();
    let nowstr = '[' + new Date().toLocaleString() + ']';

    logText += '\r\n' + nowstr + '[ ' + info + ' ]';
    textArea.val(logText);
    textArea.scrollTop(textArea[0].scrollHeight);
}

function getiCalFromUrl(urlUID, category){

    //Get URL to Labora's UID getter and add parameters
    let laboraUrl = $("#labora_url").text();
    laboraUrl += urlUID;
    laboraUrl += $("#labora_url_params").text();

    log_info('Get iCal from URL ' + laboraUrl);

    //lowercase the category to fit
    category = category.toLowerCase();
    log_info('Category : ' + category);


    //update table with data
    jQuery.get(laboraUrl, function(data, status){
        log_info('Status from labora iCal URL => ' + status);
        updateTable(data, category);
    });

}

function saveImports(){

    let homeUrl = $("#home_url").text();
    postUrl = homeUrl + "/wp-json/tm/v1/uid/";

    //run through each row - Slice will select form 0 to the end.
    let rows = $("tbody#imp_table_body tr").slice(0);


    //TODO: Must not insert when shit is already there

    //console.log(rows);
    for(let i=0; i<rows.length;i++){

        //Slice to get the uid
        rowUid = rows[i]['id'].slice(4);

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
            log_info('IMPORTING : ' + post_data.event_summary+' - ' + new Date(post_data.dtstart).toLocaleString() +' - ' + new Date(post_data.dtend).toLocaleString());
            //Fire off a post (REST API) insert/update data
            jQuery.post(postUrl, post_data, function(data, status){
                 //Whatever
                //console.log(data);

                data = JSON.stringify(data);
                data = JSON.parse(data);
                setExistingCheckbox( Array(data[0].uid), data[0].category);
            },'json');
        }
    }//End loop
}


function updateTable(data, category){

    log_info('UPDATING TABLE');
    let $place_holder = $("tbody#imp_table_body");

    //Clear the table body
    $("tbody#imp_table_body").empty();

    let result = getICalTable(data, category);
    let uids = result[0];
    let tableDOM = $.parseHTML(result[1]);

    //Append the new DOM - table content
    $place_holder.append(tableDOM);

    setExistingCheckbox(uids, category);
}

function getICalTable(data, category){

    //Get the iCal Data
    //TODO: Sort by date - howto?
    let jcalData = ICAL.parse(data);
    let vcalendar = new ICAL.Component(jcalData);
    let allSubComponents = vcalendar.getAllSubcomponents('vevent');

    //Sort events
    //Sorting by using DTSTART time (parsing)
    //TODO: Jikes ... this is fragile
    allSubComponents.sort(
        function(a,b){

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
    let uids = [];

    //Loop through subcomponents
    for (let i=0; i<allSubComponents.length; i++) {
        let summary = allSubComponents[i].getFirstPropertyValue('summary');
        let description = allSubComponents[i].getFirstPropertyValue('description');
        let dtstart = allSubComponents[i].getFirstPropertyValue('dtstart');
        let dtend = allSubComponents[i].getFirstPropertyValue('dtend');
        let uid = allSubComponents[i].getFirstPropertyValue('uid');

        //Empty strings instead of null
        if( description == null){
            description = "";
        }
        if( summary == null){
            summary = "";
        }

        uids.push(uid);

        let oneRow = "<tr id='row_" + uid + "' >";
        let tblColumn = "<td id='imp_import' class='text-center'><input id='import_" + uid + "' type='checkbox' /></td>";
        tblColumn += "<td id='imp_exists' class='text-center'><input id='exists_" + uid + "' type='radio' disabled readOnly /></td>";
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

    return [uids,tblHTML];
}

function setExistingCheckbox(lUids, category){

    let homeUrl = $("#home_url").text();
    homeUrl += "/wp-json/tm/v1/uid/";

    for(let i=0;i < lUids.length;i++){
            let restapi = homeUrl + "?id=" + lUids[i] +"&category=" + category;

            //Call the REST API
            jQuery.get(restapi, function(data, status){

                let chkExists = false;
                if( parseInt(data[0].found) == 1){
                        chkExists = true;
                        $('#row_' + data[0].uid ).prop('class', 'success');
                        $('#imp_wpid_' + data[0].uid ).text(data[0].post_id);

                }
            $('#exists_' + data[0].uid ).prop('checked', chkExists);
            $('#import_' + data[0].uid ).prop('checked', !chkExists); //Enable import because it doesn't exist
        });
    }

}