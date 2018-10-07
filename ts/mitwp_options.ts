//Import jquery TS
import * as jQuery from 'jquery';




/**
 * 
 * @param id - id of <li> elements to sort
 */
function test() {
        
    jQuery.get('http://localhost:8080/wp-json/mitwp/v1/eventcategories', function(categories : string, status : string){

    let cats = JSON.parse(categories);
    console.log(cats);
    
    for(let i = 0; i<categories.length; i++){
        
        console.log(cats[i].name);
    
    }

//alert(cats[0].name);

    });


}
