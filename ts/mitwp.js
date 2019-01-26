"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
exports.__esModule = true;
var jQuery = __importStar(require("jquery"));
var ICAL;
var mitwptrans;
function logInfo(info) {
    var nowstr = '[' + new Date().toLocaleString() + ']';
    var logText = '\r\n' + (nowstr ? nowstr : '') + '[ ' + (info ? info : '') + ' ]';
    if (logText) {
        console.log(logText);
    }
}
function getSecKey() {
    return mitwptrans.seckey;
}
function getSecRequestHeader() {
    return 'mitwp-key';
}
function sortList(id) {
    var html = $("#" + id);
    var htmlLi = $("#" + id + " li");
    var sorted = htmlLi.sort(function (a, b) { return a.innerText == b.innerText ? 0 : a.innerText < b.innerText ? -1 : 1; });
    html.html(sorted);
}
function parseHTML(html) {
    var parser = new DOMParser;
    var regp = new RegExp('</p>', 'g');
    var regbr = new RegExp('<br>', 'g');
    html = html.replace(regp, "</p>\n");
    html = html.replace(regbr, "<br>\n");
    var dom = parser.parseFromString(html, 'text/html');
    var decodedString = (dom.body.textContent != null ? dom.body.textContent : '');
    return decodedString;
}
function getApiUrl() {
    var apiurl = $("#home_url").text();
    apiurl += "mitwp/v1/events/";
    return apiurl;
}
function disableButton(buttonID, disable) {
    $("#" + buttonID).prop('disabled', disable);
}
function getiCalFromUrl(urlUID, category) {
    var laboraUrl = $("#labora_url").text();
    laboraUrl += urlUID;
    laboraUrl += $("#labora_url_params").text();
    logInfo('Get iCal from URL : ' + laboraUrl);
    category = category.toLowerCase();
    logInfo('Retrieving category : ' + category);
    disableButton("btn_choose_category", true);
    disableButton("btn_import", true);
    jQuery.get(laboraUrl, function (iCalAsString, status) {
        logInfo('HTTP Response from labora iCal URL => ' + status);
        updateTable(iCalAsString, category);
        disableButton("btn_choose_category", false);
        disableButton("btn_import", false);
    });
}
function deleteFromWP(rowuid) {
    var restapi = getApiUrl();
    var postid = $("#imp_wpid_" + rowuid).text();
    var category = $("#imp_data_category_" + rowuid + " span").text();
    restapi += "?postid=" + postid + "&category=" + category;
    $.ajax({
        url: restapi,
        type: 'DELETE',
        beforeSend: function (xhr) {
            xhr.setRequestHeader(getSecRequestHeader(), getSecKey());
        },
        success: function (result) {
            result = JSON.parse(result);
            if (result.success = 'true') {
                logInfo('Post_id [' + result.post_id + '] Deleted - [' + result.success + ']');
                setExistingCheckbox(Array(rowuid), category);
            }
            else {
                logInfo('Could not delete? - DELETE returned ' + result.success + ' for Post ' + result.post_id);
            }
        },
        error: function () {
            logInfo('ERROR - REST API did not receive success - post id => ' + postid);
        }
    });
}
function saveImports() {
    var apiurl = getApiUrl();
    var rows = $("tbody#imp_table_body tr").slice(0);
    for (var i = 0; i < rows.length; i++) {
        var rowUid = rows[i]['id'].slice(4);
        var importOrNot = $("#import_" + rowUid).is(':checked');
        var existsOrNot = $("#exists_" + rowUid).is(':checked');
        var rowSummary = $("#imp_summary_" + rowUid + " span").text();
        var rowCategory = $("#imp_data_category_" + rowUid + " span").text();
        var rowDescription = $("#imp_description_" + rowUid + " span").html();
        rowDescription = parseHTML(rowDescription);
        var rowdtStart = $("#imp_dtstart_utc_" + rowUid).text();
        var rowdtEnd = $("#imp_dtend_utc_" + rowUid).text();
        var rowUTCTZOffset = $("#imp_utctzoffset_" + rowUid).text();
        var postID = $("#imp_wpid_" + rowUid).text();
        var wpUserID = $("#wp_user_id").text();
        var postdata = {
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
            logInfo('IMPORTING TO WP : ' + postdata.event_summary + ' - '
                + new Date(postdata.dtstart).toLocaleString() + ' - '
                + new Date(postdata.dtend).toLocaleString());
            $.ajax({
                url: apiurl,
                data: postdata,
                method: 'POST',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(getSecRequestHeader(), getSecKey());
                },
                success: function (data) {
                    disableButton("btn_choose_category", true);
                    disableButton("btn_import", true);
                    data = JSON.parse(data);
                    setExistingCheckbox(Array(data.uid), data.category);
                    disableButton("btn_choose_category", false);
                    disableButton("btn_import", false);
                },
                error: function (jqXHR, status, errorthrown) {
                    logInfo(status + ' - ' + errorthrown + ' - ' + jqXHR.responseText);
                }
            });
        }
    }
}
function updateTable(iCalAsString, category) {
    logInfo('Updating table with Category => ' + category);
    var $place_holder = $("tbody#imp_table_body");
    $("tbody#imp_table_body").empty();
    var result = getICalTable(iCalAsString, category);
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
        var dtstart_a = a.getFirstPropertyValue('dtstart');
        var dtstart_b = b.getFirstPropertyValue('dtstart');
        var date_a = new Date(dtstart_a);
        var date_b = new Date(dtstart_b);
        var testa = Math.round(date_a.getTime() / 1000);
        var testb = Math.round(date_b.getTime() / 1000);
        return (testa - testb);
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
        tblColumn += "<td id='imp_exists' class='text-center'><span id='imp_exists_icon_" + uid + "' class=''></span>&nbsp;";
        tblColumn += "<input style='opacity: 0;' id='exists_" + uid + "' type='radio' disabled readOnly />";
        tblColumn += "&nbsp;&nbsp;<button id='delete_wpid_" + uid + "' onclick='deleteFromWP(\"" + uid + "\")' class='btn btn-danger' disabled>" + mitwptrans["delete"] + "</td>";
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
function setExistingCheckbox(uids, category) {
    var apiurl = getApiUrl();
    disableButton("btn_choose_category", true);
    disableButton("btn_import", true);
    logInfo('Check if posts exists in WP - if so mark the rows');
    var _loop_1 = function (i) {
        var gylphicon = 'glyphicon ';
        var summary = $("#imp_summary_" + uids[i] + " span").text();
        var dtstart = $("#imp_dtstart_utc_" + uids[i]).text();
        var dtend = $("#imp_dtend_utc_" + uids[i]).text();
        var restapi = apiurl + "?uid=" + uids[i] + "&category=" + category + "&dtstart=" + dtstart + "&dtend=" + dtend + "&title=" + summary;
        $.ajax({
            url: restapi,
            method: 'GET',
            contentType: 'application/json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader(getSecRequestHeader(), getSecKey());
            },
            success: function (data) {
                logInfo('Status from REST API : ' + status);
                data = JSON.parse(data);
                disableButton("btn_choose_category", true);
                disableButton("btn_import", true);
                var chkExists = false;
                if (parseInt(data.found) == 1) {
                    chkExists = true;
                    gylphicon += 'glyphicon-thumbs-up';
                    $('#row_' + data.uid).prop('class', 'success');
                    $('#imp_wpid_' + data.uid).text(data.post_id);
                }
                else {
                    $('#row_' + data.uid).prop('class', '');
                    $('#imp_wpid_' + data.uid).text('');
                    gylphicon += 'glyphicon-thumbs-down';
                }
                $('#exists_' + data.uid).prop('checked', chkExists);
                $('#imp_exists_icon_' + data.uid).prop('class', gylphicon);
                disableButton("delete_wpid_" + data.uid, !chkExists);
                $('#import_' + data.uid).prop('checked', !chkExists);
                disableButton("btn_choose_category", false);
                disableButton("btn_import", false);
            },
            error: function (jqXHR, status, errorthrown) {
                logInfo(status + ' - ' + errorthrown + ' - ' + jqXHR.responseText);
            }
        });
    };
    for (var i = 0; i < uids.length; i++) {
        _loop_1(i);
    }
}
