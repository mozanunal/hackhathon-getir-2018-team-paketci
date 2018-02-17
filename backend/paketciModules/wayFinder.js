var request = require("request");
var bodyparser = require("body-parser");
var polylineParser = require("./polylineParser");
var url="";



var destinationPoints = (originString, destinationString, keyString, callback) => {
    var params = {
        // REQUIRED 
        origin: originString,
        destination: destinationString,
        key: "AIzaSyDDMAGBe2tkSH8SJ4Vu1GRK7WaEKfSABrA",
    };
    request.post({
        url:     'https://maps.googleapis.com/maps/api/directions/json?origin='+params.origin+'&destination='+params.destination+'&key='+params.key,
       // form:    { params }
      }, function(error, response, body){
        //console.log(body);
        if(error) {
            console.log(error);
            return 1;
        }
    
      //  console.log(polylineParser.decode(JSON.parse(body).routes[0].overview_polyline.points));
        
        var a = polylineParser.decode(JSON.parse(body).routes[0].overview_polyline.points);
        {
            callback(a); 
        }
       
       
        
        
      });

      

}
module.exports.FindWay = destinationPoints;