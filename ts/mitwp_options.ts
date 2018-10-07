//Import jquery TS
import * as jQuery from 'jquery';

//Contains translated strings fired off at the wp side
//Transferd as this variable
let mitwpoptiontrans : any;

function getSecKey() : string {
    return mitwpoptiontrans.seckey;
}


/**
 * 
 * @param id - id of <li> elements to sort
 */
function test() {
        
    $.ajax({
            url: 'http://localhost:8080/wp-json/mitwp/v1/eventcategories',
            method: 'GET',
            contentType: 'application/json',
            //crossDomain: true,
        // xhrFields:{withCredentials: true},
            beforeSend: function(xhr){
                xhr.setRequestHeader('mitwp-key', getSecKey());
            },
            success: function(categories : string){
                let cats = JSON.parse(categories);
                console.log(cats);
                
                for(let i = 0; i<categories.length; i++){
                    
                    console.log(cats[i].name);
                
                }
                }
    
    });


}
