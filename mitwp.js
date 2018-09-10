

function disableImpButton(value){
    $("#start-test-btn").prop("disabled",value);
}

function getiCalFromUrl(urlUID){

    //TODO: Make this dissapear - use settings for the plugin
    laboraUrl = "https://wsu4.mylabora.com/churchhubrelease/icalhandler.ashx?iCal=";
    laboraUrl += urlUID;
    laboraUrl += "&M=12&pub=true&pubtext=default";

    //Disable button and get data
    disableImpButton(true);
    jQuery.get(laboraUrl, function(data, status){
        setTimeout(function(){updateTable(data);disableImpButton(false);}, 300);
    });

}

function saveImports(urlUID){

    var homeUrl = $("#home_url").text();
    postUrl = homeUrl + "/wp-json/tm/v1/uid/";
    //curl --data "uid=86c4c246-2ccb-400c-b3eb-f8575a5d3f8fe&category=gudstjeneste" -X POST http://localhost:8080/wp-json/tm/v1/uid

    //Loop igjennom - hent UID, Tittel, Fra og til dato, beskrivelse
    //Post og lag ny
/*
    //run through each row
    //var rows = $("#imp_table tr:gt(0)");
    var rows = $("#imp_table_body tr:gt(0)");



    rows.each(function(index) {
        var importornot = $("td:nth-child(1) input", this);
        var summary = $("td:nth-child(3) div", this);
        console.log(importornot.val());
        console.log(summary.val());
    });
*/

    var post_data = {uid: "234234DF",
        category: "gudstjeneste",
        dtend : new Date(),
        summary : "summary"
    };

    jQuery.post(postUrl, post_data, function(data, status){

        console.log(status);

        },'json');
}


function updateTable(data){

    var $place_holder = $("tbody#imp_table_body");

    //Empty the table body
    $("tbody#imp_table_body").empty();

    var result = getICalTable(data);
    var uids = result[0];
    var tableDOM = $.parseHTML(result[1]);

    //Append the new DOM - table content
    $place_holder.append(tableDOM);

    setExistingCheckbox(uids);
}

function getICalTable(data){

    //Get the iCal Data
    var jcalData = ICAL.parse(data);
    var vcalendar = new ICAL.Component(jcalData);
    var allSubComponents = vcalendar.getAllSubcomponents('vevent');
    var tblHTML = "";
    var chosenCategory = $("#chosen option:selected").attr('id');

    var uids = [];

    //Loop through subcomponents
    var everySecondRow = true;
    for (var i = 1; i < allSubComponents.length; i++) {
        var summary = allSubComponents[i].getFirstPropertyValue('summary');
        var description = allSubComponents[i].getFirstPropertyValue('description');
        var dtstart = allSubComponents[i].getFirstPropertyValue('dtstart');
        var dtend = allSubComponents[i].getFirstPropertyValue('dtend');
        var uid = allSubComponents[i].getFirstPropertyValue('uid');

        uids.push(uid);

        var rowClass = "";
        if(everySecondRow){
            everySecondRow=false;
            rowClass = "active";
        }else{
            everySecondRow=true;
            rowClass = "";
        }
        var oneRow = "<tr class='"+ rowClass + "' id='row_" + uid + "'>";

        var tblColumn = "<td id='imp_import' class='text-center'><input id='import_" + uid + "' type='checkbox' /></td>";
        tblColumn += "<td id='imp_exists' class='text-center'><input id='exists_" + uid + "' type='radio' disabled readOnly /></td>";
        tblColumn += "<td id='imp_summary'><span id='span_summary' >"+summary+"</span></td>";
        tblColumn += "<td id='imp_dtstart' class='text-center'><span id='span_dtstart'>"+
            new Date(dtstart).toLocaleString()+"</span></td>";
        tblColumn += "<td id='imp_dtend' class='text-center'><span id='span_dtend'>"+
            new Date(dtend).toLocaleString()+"</span></td>";
        tblColumn += "<td id='imp_description'><span id='lbl_description'>"+description+"</span></td>";

        //Hidden TDs
        tblColumn += "<td id='imp_data_uid' style='display: none;'>" + uid +"</td>";
        tblColumn += "<td id='imp_data_category' style='display: none;'>" + chosenCategory +"</td>";


        oneRow += tblColumn;
        tblHTML += oneRow  +"</tr>";
    }

    return [uids,tblHTML];
}

function setExistingCheckbox(lUids){

    var homeUrl = $("#home_url").text();
    homeUrl += "/wp-json/tm/v1/uid/";

    for(var i=0;i < lUids.length;i++){
            var restapi = homeUrl + "?id=" + lUids[i] +"&category=gudstjeneste";

            //Call the REST API
            jQuery.get(restapi, function(data, status){

            //TODO: FAA DEN TIL Å RETURNERE 200 og 404

            var chkExists = false;
            if( parseInt(data[0].found) == 1){
                chkExists = true;
                $('#row_' + data[0].uid ).prop('class', 'success');
            }
            $('#exists_' + data[0].uid ).prop('checked', chkExists);
            $('#import_' + data[0].uid ).prop('checked', !chkExists); //Enable import because it doesn't exist
        });
    }

}