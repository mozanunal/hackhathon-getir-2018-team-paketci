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
       // var wayPoints = [];
       var wayPoints = [];
        //console.log(body);
        var legsArray = JSON.parse(body).routes[0].legs;
      
        //var a = polylineParser.decode(JSON.parse(body).routes[0].overview_polyline.points);

        legsArray.map(leg=>{
            var stepsArray = leg.steps;
            stepsArray.map(step=> {
               // wayPoints.concat(step.polyline.points);
               //wayPoints += step.polyline.points;
                 //wayPoints = wayPoints.concat(polylineParser.decode(step.polyline.points));
              // console.log(polylineParser.decode(step.polyline.points));
            });
        });
        for(i=0;i<legsArray.length; i++) {
            for(j=0;j<legsArray[i].steps.length;j++) {
                //wayPoints = wayPoints.concat(legsArray[i].steps[j].polyline.points);
                wayPoints = wayPoints.concat(polylineParser.decode(legsArray[i].steps[j].polyline.points));
               // console.log(polylineParser.decode(legsArray[i].steps[j].polyline.points));
            }
        }
        console.log(polylineParser.decode("}kpaGf{upLA?QHSJQJURMJQNMLKLIHIJIJGHCDMZIR[v@"));
        
        callback(wayPoints);
        //console.log(wayPoints);
        //console.log(polylineParser.decode("espaGncvpLUSECAAEEEICCCEIMCIEI[{@Ys@M[_@_Ac@mAk@yAUk@GQEM"));

        
       
        
        
      });

}
destinationPoints("40.7143528,-74.0059731","40.5143528,-74.2059731","akey",()=>{});

module.exports.FindWay = destinationPoints;