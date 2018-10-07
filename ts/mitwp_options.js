"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mitwpoptiontrans;
function getSecKey() {
    return mitwpoptiontrans.seckey;
}
function test() {
    $.ajax({
        url: 'http://localhost:8080/wp-json/mitwp/v1/eventcategories',
        method: 'GET',
        contentType: 'application/json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('mitwp-key', getSecKey());
        },
        success: function (categories) {
            var cats = JSON.parse(categories);
            console.log(cats);
            for (var i = 0; i < categories.length; i++) {
                console.log(cats[i].name);
            }
        }
    });
}
