"use strict";
exports.__esModule = true;
var mitwpoptiontrans;
function getSecKey() {
    return mitwpoptiontrans.seckey;
}
function getApiUrl() {
    return mitwpoptiontrans.apiurl + "mitwp/v1/eventcategories/";
}
function getCategories() {
    var apiurl = getApiUrl();
    $.ajax({
        url: apiurl,
        method: 'GET',
        contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('mitwp-key', getSecKey());
        },
        success: function (categories) {
            console.log(categories);
            var cats = JSON.parse(categories);
            console.log(cats);
            for (var i = 0; i < categories.length; i++) {
                console.log(cats[i]);
            }
        },
        error: function (jqXHR, status, errorthrown) {
            console.log(status + ' - ' + errorthrown + ' - ' + jqXHR.responseText);
        }
    });
}
