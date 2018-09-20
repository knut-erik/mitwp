"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var jQuery = __importStar(require("jquery"));
var ICAL;
function log_info(info) {
    var textArea = $("#log");
    var logText = textArea.val();
    var nowstr = '[' + new Date().toLocaleString() + ']';
    logText += '\r\n' + nowstr + '[ ' + info + ' ]';
    if (logText) {
        textArea.val(logText);
    }
    textArea.scrollTop(textArea[0].scrollHeight);
}
function disableButton(buttonID, disabled) {
    $("#" + buttonID).prop('disabled', disabled);
}
function getiCalFromUrl(urlUID, category) {
    var laboraUrl = $("#labora_url").text();
    laboraUrl += urlUID;
    laboraUrl += $("#labora_url_params").text();
    log_info('Get iCal from URL : ' + laboraUrl);
    category = category.toLowerCase();
    log_info('Retrieving category : ' + category);
    disableButton("btn_choose_category", true);
    disableButton("btn_import", true);
    jQuery.get(laboraUrl, function (iCalAsString, status) {
        log_info('HTTP Response from labora iCal URL => ' + status);
        updateTable(iCalAsString, category);
        disableButton("btn_choose_category", false);
        disableButton("btn_import", false);
    });
}
function saveImports() {
    var homeUrl = $("#home_url").text();
    var postUrl = homeUrl + "/wp-json/tm/v1/uid/";
    var rows = $("tbody#imp_table_body tr").slice(0);
    for (var i = 0; i < rows.length; i++) {
        var rowUid = rows[i]['id'].slice(4);
        var importOrNot = $("#import_" + rowUid).is(':checked');
        var existsOrNot = $("#exists_" + rowUid).is(':checked');
        var rowSummary = $("#imp_summary_" + rowUid + " span").text();
        var rowCategory = $("#imp_data_category_" + rowUid + " span").text();
        var rowDescription = $("#imp_description_" + rowUid + " span").html();
        var rowdtStart = $("#imp_dtstart_utc_" + rowUid).text();
        var rowdtEnd = $("#imp_dtend_utc_" + rowUid).text();
        var rowUTCTZOffset = $("#imp_utctzoffset_" + rowUid).text();
        var postID = $("#imp_wpid_" + rowUid).text();
        var wpUserID = $("#wp_user_id").text();
        var post_data = {
            uid: rowUid,
            category: rowCategory,
            dtstart: rowdtStart,
            dtend: rowdtEnd,
            description: rowDescription,
            event_summary: rowSummary,
            utctzoffset: rowUTCTZOffset,
            post_id: postID,
            user_id: wpUserID,
            exists: existsOrNot
        };
        if (importOrNot) {
            log_info('IMPORTING TO WP : ' + post_data.event_summary + ' - '
                + new Date(post_data.dtstart).toLocaleString() + ' - '
                + new Date(post_data.dtend).toLocaleString());
            jQuery.post(postUrl, post_data, function (data, status) {
                disableButton("btn_choose_category", true);
                disableButton("btn_import", true);
                data = JSON.stringify(data);
                data = JSON.parse(data);
                setExistingCheckbox(Array(data[0].uid), data[0].category);
                disableButton("btn_choose_category", false);
                disableButton("btn_import", false);
            }, 'json');
        }
    }
}
function updateTable(data, category) {
    log_info('Updating table with Category => ' + category);
    var $place_holder = $("tbody#imp_table_body");
    $("tbody#imp_table_body").empty();
    var result = getICalTable(data, category);
    var uids = result[0];
    var tableDOM = $.parseHTML(result[1]);
    $place_holder.append(tableDOM);
    setExistingCheckbox(uids, category);
}
function getICalTable(iCalAsString, category) {
    disableButton("btn_choose_category", true);
    disableButton("btn_import", true);
    var jcalData = ICAL.parse(iCalAsString);
    var vcalendar = new ICAL.Component(jcalData);
    var allSubComponents = vcalendar.getAllSubcomponents('vevent');
    allSubComponents.sort(function (a, b) {
        var eventa = a.toString();
        var eventb = b.toString();
        var toindex = eventa.indexOf(":", eventa.indexOf("DTSTART;"));
        var firstDateAsNumber = eventa.substring(toindex + 1, toindex + 9);
        toindex = eventb.indexOf(":", eventb.indexOf("DTSTART;"));
        var secondDateAsNumber = eventb.substring(toindex + 1, toindex + 9);
        return (firstDateAsNumber > secondDateAsNumber);
    });
    var tblHTML = "";
    var uids = [];
    for (var i = 0; i < allSubComponents.length; i++) {
        var summary = allSubComponents[i].getFirstPropertyValue('summary');
        var description = allSubComponents[i].getFirstPropertyValue('description');
        var dtstart = allSubComponents[i].getFirstPropertyValue('dtstart');
        var dtend = allSubComponents[i].getFirstPropertyValue('dtend');
        var uid = allSubComponents[i].getFirstPropertyValue('uid');
        uids.push(uid);
        if (description == null) {
            description = "";
        }
        if (summary == null) {
            summary = "";
        }
        var oneRow = "<tr id='row_" + uid + "' >";
        var tblColumn = "<td id='imp_import' class='text-center'><input id='import_" + uid + "' type='checkbox' /></td>";
        tblColumn += "<td id='imp_exists' class='text-center'><input id='exists_" + uid + "' type='radio' disabled readOnly /></td>";
        tblColumn += "<td id='imp_summary_" + uid + "'><span>" + summary + "</span></td>";
        tblColumn += "<td id='imp_dtstart_" + uid + "' class='text-center'><span>" + new Date(dtstart).toLocaleString() + "</span></td>";
        tblColumn += "<td id='imp_dtend' class='text-center'><span id='span_dtend'>" + new Date(dtend).toLocaleString() + "</span></td>";
        tblColumn += "<td id='imp_description_" + uid + "'><span>" + description + "</span></td>";
        tblColumn += "<td id='imp_data_uid' style='display: none;'>" + uid + "</td>";
        tblColumn += "<td id='imp_dtstart_utc_" + uid + "' style='display: none;'>" + new Date(dtstart).toUTCString() + "</td>";
        tblColumn += "<td id='imp_dtend_utc_" + uid + "' style='display: none;'>" + new Date(dtend).toUTCString() + "</td>";
        tblColumn += "<td id='imp_utctzoffset_" + uid + "' style='display: none;'>" + new Date(dtstart).getTimezoneOffset() + "</td>";
        tblColumn += "<td id='imp_wpid_" + uid + "' style='display: none;'></td>";
        tblColumn += "<td id='imp_data_category_" + uid + "' style='display: none;'><span>" + category + "</span></td>";
        oneRow += tblColumn;
        tblHTML += oneRow + "</tr>";
    }
    disableButton("btn_choose_category", false);
    disableButton("btn_import", false);
    return [uids, tblHTML];
}
function setExistingCheckbox(lUids, category) {
    var homeUrl = $("#home_url").text();
    homeUrl += "/wp-json/tm/v1/uid/";
    disableButton("btn_choose_category", true);
    disableButton("btn_import", true);
    log_info('Check if posts exists in WP - if so mark the rows');
    for (var i = 0; i < lUids.length; i++) {
        var restapi = homeUrl + "?id=" + lUids[i] + "&category=" + category;
        jQuery.get(restapi, function (data, status) {
            disableButton("btn_choose_category", true);
            disableButton("btn_import", true);
            var chkExists = false;
            if (parseInt(data[0].found) == 1) {
                chkExists = true;
                $('#row_' + data[0].uid).prop('class', 'success');
                $('#imp_wpid_' + data[0].uid).text(data[0].post_id);
            }
            $('#exists_' + data[0].uid).prop('checked', chkExists);
            $('#import_' + data[0].uid).prop('checked', !chkExists);
            disableButton("btn_choose_category", false);
            disableButton("btn_import", false);
        });
    }
}
