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
function test() {
    jQuery.get('http://localhost:8080/wp-json/tm/v1/eventcategories', function (categories, status) {
        var cats = JSON.parse(categories);
        console.log(cats);
        for (var i = 0; i < categories.length; i++) {
            console.log(cats[i].name);
        }
    });
}
