
function log_info(info){

    var logText = $("#log").val();
    var nowstr = '[' + new Date().toLocaleString() + ']';

    logText += '\r\n' + nowstr + '[ ' + info + ' ]';
    $("#log").val(logText);

}

function getiCalFromUrl(urlUID, category){

    //TODO: Make this dissapear - use settings for the plugin
    laboraUrl = "https://wsu4.mylabora.com/churchhubrelease/icalhandler.ashx?iCal=";
    laboraUrl += urlUID;
    laboraUrl += "&M=12&pub=true&pubtext=default";

    log_info('Get iCal from URL ' + laboraUrl);

    //lowercase the category to fit
    category = category.toLowerCase();
    log_info('Category : ' + category);


    //update table with data
    jQuery.get(laboraUrl, function(data, status){
        updateTable(data, category);
    });

}

function saveImports(){

    var homeUrl = $("#home_url").text();
    postUrl = homeUrl + "/wp-json/tm/v1/uid/";

    //run through each row - Slice will select form 0 to the end.
    var rows = $("tbody#imp_table_body tr").slice(0);


    //TODO: Must not insert when shit is already there

    //console.log(rows);
    for(var i=0; i<rows.length;i++){

        //Slice to get the uid
        rowUid = rows[i]['id'].slice(4);

        var importOrNot = $("#import_"+rowUid).is(':checked');
        var existsOrNot = $("#exists_"+rowUid).is(':checked');
        var rowSummary = $("#imp_summary_"+rowUid+ " span").text();
        var rowCategory = $("#imp_data_category_"+rowUid+ " span").text();
        var rowDescription = $("#imp_description_"+rowUid+ " span").html();
        var rowdtStart = $("#imp_dtstart_utc_"+rowUid).text();
        var rowdtEnd = $("#imp_dtend_utc_"+rowUid).text();
        var rowUTCTZOffset = $("#imp_utctzoffset_"+rowUid).text();
        var postID = $("#imp_wpid_"+rowUid).text();
        var wpUserID = $("#wp_user_id").text();

        var post_data = {
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
    var $place_holder = $("tbody#imp_table_body");

    //Clear the table body
    $("tbody#imp_table_body").empty();

    var result = getICalTable(data, category);
    var uids = result[0];
    var tableDOM = $.parseHTML(result[1]);

    //Append the new DOM - table content
    $place_holder.append(tableDOM);

    setExistingCheckbox(uids, category);
}

function getICalTable(data, category){

    //Get the iCal Data
    //TODO: Sort by date - howto?
    var jcalData = ICAL.parse(data);
    var vcalendar = new ICAL.Component(jcalData);
    var allSubComponents = vcalendar.getAllSubcomponents('vevent');
    var tblHTML = "";
    //var chosenCategory = $("#chosen option:selected").attr('id');

    var uids = [];

    //Loop through subcomponents
    for (var i=0; i<allSubComponents.length; i++) {
        var summary = allSubComponents[i].getFirstPropertyValue('summary');
        var description = allSubComponents[i].getFirstPropertyValue('description');
        var dtstart = allSubComponents[i].getFirstPropertyValue('dtstart');
        var dtend = allSubComponents[i].getFirstPropertyValue('dtend');
        var uid = allSubComponents[i].getFirstPropertyValue('uid');

        //Empty strings instead of null
        if( description == null){
            description = "";
        }
        if( summary == null){
            summary = "";
        }

        uids.push(uid);

        var oneRow = "<tr id='row_" + uid + "' >";
        var tblColumn = "<td id='imp_import' class='text-center'><input id='import_" + uid + "' type='checkbox' /></td>";
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

    var homeUrl = $("#home_url").text();
    homeUrl += "/wp-json/tm/v1/uid/";

    for(var i=0;i < lUids.length;i++){
            var restapi = homeUrl + "?id=" + lUids[i] +"&category=" + category;

            //Call the REST API
            jQuery.get(restapi, function(data, status){

                var chkExists = false;
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