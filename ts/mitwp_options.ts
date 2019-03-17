//Import jquery TS
import * as jQuery from 'jquery';

//Contains translated strings fired off at the wp side
//Transferd as this variable
let mitwpoptiontrans : any;

/**
 * Returns security key
 * @returns {string} - security key
 */
function getSecKey() : string {
    return mitwpoptiontrans.seckey;
}

/**
 * Return url to REST API
 * @returns {string} - The url to the REST API
 */
function getApiUrl() : string {  
    return mitwpoptiontrans.apiurl + "mitwp/v1/eventcategories/";
}

/**
 * 
 * @param id - id of <li> elements to sort
 * 
 */
function getCategories() {
        
    let apiurl : string = getApiUrl();

    $.ajax({
            url: apiurl,
            method: 'GET',
            contentType: 'application/json',
            //crossDomain: true,
            //xhrFields:{withCredentials: true},
            beforeSend: function(xhr){
                xhr.setRequestHeader('mitwp-key', getSecKey());
            },
            success: function(categories : string){
                console.log(categories);
                let cats = JSON.parse(categories);
                console.log(cats);
                
                for(let i = 0; i<categories.length; i++){
                    
                    //console.log(cats[i].name);
                    console.log(cats[i]);
                
                }
            }, 
            error: function(jqXHR, status, errorthrown ){ 
                console.log(status + ' - ' + errorthrown + ' - ' + jqXHR.responseText); 
            }
    
    });


}
