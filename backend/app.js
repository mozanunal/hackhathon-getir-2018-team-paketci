var express = require('express');
var app = express();

var parsedJSON = require('./db.json');
var math = require('mathjs');
var pld = require('point-line-distance');

function randomRange(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min
}

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

/*
Is it really working?
*/
app.get('/', function (req, res) {
    res.send('hello world');
});

app.get('/courierRouter', function (req, res) {

});

/*
Courier api
for calling courier database
*/
app.get('/api/courier', function (req, res) {
    res.send(parsedJSON.couriers);
});

app.get('/api/courier/:id', function (req, res) {
    res.send(parsedJSON.couriers[req.params.id]);
});

/*
Packet api
for calling packet database
*/
app.get('/api/packet', function (req, res) {
    res.send(parsedJSON.packets);
});

app.get('/api/packet/:id', function (req, res) {
    res.send(parsedJSON.packets[req.params.id]);
});

/*
Route api
for calling route database
*/
app.get('/api/route', function (req, res) {
    res.send(parsedJSON.routes);
});

app.get('/api/route/:id', function (req, res) {
    res.send(parsedJSON.routes[req.params.id]);
});


var courierNumber = 3;
var packetNumber = 10;

/*
To create random couriers and packets.
To calculate all routes avaliable.
*/
app.get('/api/create', function (req, res) {

    /* Courier Creator */
    for (var i = 0; i < courierNumber; i++) {
        var loc = {
            "lat": randomRange(42, 36),
            "long": randomRange(19, 45)
        };
        var courier = {
            "_id": i,
            "initLocation": loc,
            "curLocation": loc,
            "weightCapacity": 20,
            "remainingWeightCapacity": 20,
            "pieceCapacity": 5,
            "remainingPieceCapacity": 5,
            "routes": [],
            "packets": []
        };
        parsedJSON.couriers.push(courier);
    }

    /* Packet Creator */
    for (var i = 0; i < packetNumber; i++) {
        var packet = {
            "_id": i,
            "initLocation": {
                "lat": randomRange(42, 36),
                "long": randomRange(19, 45)
            },
            "destLocation": {
                "lat": 39,
                "long": 32
            },
            "weight": randomRange(1, 5),
            "state": 0,
            "courier": {}
        };
        parsedJSON.packets.push(packet);
    }

    /* Route Creator */

    /* Courier starting location to delivery location*/
    var routeID = 0;
    for (var i = 0; i < courierNumber; i++) {
        var distanceBetweenPoints = math.distance([parsedJSON.couriers[i].initLocation.lat, parsedJSON.couriers[i].initLocation.long], [parsedJSON.packets[0].destLocation.lat, parsedJSON.packets[0].destLocation.long]);

        var route = {
            "_id": routeID,
            "routeFromGoogle": "",
            "distance": distanceBetweenPoints,
            "startLoc": parsedJSON.couriers[i].initLocation,
            "endLoc": parsedJSON.packets[0].destLocation,
            "nearPacketsDistance": [],
            "state": 0
        };
        parsedJSON.routes.push(route);
        routeID++;
    }

    /* Courier starting location to packet location*/
    for (var i = 0; i < courierNumber; i++) {
        for (var j = 0; j < packetNumber; j++) {
            //var x = parsedJSON.couriers[courierNumber].initLocation.lat;

            var distanceBetweenPoints = math.distance([parsedJSON.couriers[i].initLocation.lat, parsedJSON.couriers[i].initLocation.long], [parsedJSON.packets[j].initLocation.lat, parsedJSON.packets[j].initLocation.long]);

            var route = {
                "_id": routeID,
                "routeFromGoogle": "",
                "distance": distanceBetweenPoints,
                "startLoc": parsedJSON.couriers[i].initLocation,
                "endLoc": parsedJSON.packets[j].initLocation,
                "nearPacketsDistance": [],
                "state": 0
            };
            parsedJSON.routes.push(route);
            routeID++;
        }
    }

    /* Packet location to packet location*/
    for (var i = 0; i < packetNumber; i++) {
        for (var j = 0; j < packetNumber; j++) {
            //var x = parsedJSON.couriers[courierNumber].initLocation.lat;

            var distanceBetweenPoints = math.distance([parsedJSON.packets[i].initLocation.lat, parsedJSON.packets[i].initLocation.long], [parsedJSON.packets[j].initLocation.lat, parsedJSON.packets[j].initLocation.long]);

            var route = {
                "_id": routeID,
                "routeFromGoogle": "",
                "distance": distanceBetweenPoints,
                "startLoc": parsedJSON.packets[i].initLocation,
                "endLoc": parsedJSON.packets[j].initLocation,
                "nearPacketsDistance": [],
                "state": 0
            };
            parsedJSON.routes.push(route);
            routeID++;
        }
    }

    /* Packet location to delivery location*/
    for (var i = 0; i < packetNumber; i++) {

        var distanceBetweenPoints = math.distance([parsedJSON.packets[i].initLocation.lat, parsedJSON.packets[i].initLocation.long], [parsedJSON.packets[i].destLocation.lat, parsedJSON.packets[i].destLocation.long]);

        var route = {
            "_id": routeID,
            "routeFromGoogle": "",
            "distance": distanceBetweenPoints,
            "startLoc": parsedJSON.packets[i].initLocation,
            "endLoc": parsedJSON.packets[i].destLocation,
            "nearPacketsDistance": [],
            "state": 0
        };
        parsedJSON.routes.push(route);
        routeID++;
    }

    /* Calculate distance between route and any packet location */
    for (var i = 0; i < routeID; i++) {
        for (var j = 0; j < packetNumber; j++) {
            var point = [parsedJSON.packets[j].initLocation.lat, parsedJSON.packets[j].initLocation.long, 0];
            var a = [parsedJSON.routes[i].startLoc.lat, parsedJSON.routes[i].startLoc.long, 0];
            var b = [parsedJSON.routes[i].endLoc.lat, parsedJSON.routes[i].endLoc.long, 0];
            var distanceToPacket = 0;
            if ((a[0] != b[0]) || (a[1] != b[1])) {
                distanceToPacket = pld(point, a, b);
            }
            //console.log("routeID= " + i + "  packetID= " + j);
            //console.log(distanceToPacket);
            //console.log(a);
            //console.log(b);
            parsedJSON.routes[i].nearPacketsDistance.push(distanceToPacket);
        }
    }
    res.send(parsedJSON);
});


/*
To create random couriers and packets.
To calculate all routes avaliable.
*/
app.get('/api/routeOptimize', function (req, res) {

    for (var i = 0; i < courierNumber; i++) {
        parsedJSON.couriers[i].routes.push(parsedJSON.routes[i]);
        parsedJSON.routes[i].state = 1;
        //console.log("kurye= " + i);
    }

    for (var packetCounter = 0; packetCounter < packetNumber; packetCounter++) {
        var maxPossibleDistance = 1000000;
        var min = maxPossibleDistance;
        var minIndexCourier = -1;
        var minIndexRoute = -1;
        var minIndexPacket = -1;

        for (var i = 0; i < courierNumber; i++) {
            for (var j = 0; j < parsedJSON.couriers[i].routes.length; j++) {
                for (var k = 0; k < packetNumber; k++) {
                    //console.log("packetNumber = ", k, "routes = ", j, "couriers= ", i);
                    //console.log("nearPacketsDistance= ", parsedJSON.couriers[i].routes[j].nearPacketsDistance[k]);
                    if ((parsedJSON.couriers[i].routes[j].nearPacketsDistance[k] < min) && (parsedJSON.couriers[i].routes[j].nearPacketsDistance[k] != -1)) {
                        if ((parsedJSON.packets[k].weight < parsedJSON.couriers[i].remainingWeightCapacity) && (parsedJSON.couriers[i].remainingPieceCapacity > 0)) {
                            min = parsedJSON.couriers[i].routes[j].nearPacketsDistance[k];
                            minIndexCourier = i;
                            minIndexLocalRoute = j;
                            minIndexPacket = k;
                            // console.log("nearPacketsDistance= ", min, "  minIndexCourier= " + minIndexCourier + "  minIndexRoute= " + minIndexRoute + "  minIndexPacket= " + minIndexPacket);
                        }
                    }
                }
            }
        }
        //console.log("=====================", "  nearPacketsDistance= ", min, "  minIndexCourier= " + minIndexCourier + "  minIndexRoute= " + minIndexRoute + "  minIndexPacket= " + minIndexPacket);

        var newRouteIndex1 = -1;
        var newRouteIndex2 = -1;
        //var oldRouteID = parsedJSON.couriers[minIndexCourier].routes[minIndexRoute]._id;
        var oldLocalRouteID = minIndexLocalRoute;
        var oldRouteID = parsedJSON.couriers[minIndexCourier].routes[minIndexLocalRoute]._id;
        //console.log("minIndexRoute= ", minIndexRoute);
        //console.log("oldRouteID= ", oldRouteID);

        if (minIndexLocalRoute != -1) {

            for (var i = 0; i < parsedJSON.routes.length; i++) {
                parsedJSON.routes[i].nearPacketsDistance[minIndexPacket] = -1;
                if ((parsedJSON.routes[oldRouteID].startLoc.lat == parsedJSON.routes[i].startLoc.lat)
                    && (parsedJSON.routes[oldRouteID].startLoc.long == parsedJSON.routes[i].startLoc.long)) {
                    if ((parsedJSON.routes[i].endLoc.lat == parsedJSON.packets[minIndexPacket].initLocation.lat)
                        && (parsedJSON.routes[i].endLoc.long == parsedJSON.packets[minIndexPacket].initLocation.long)) {
                        newRouteIndex1 = i;
                    }
                }
                if ((parsedJSON.routes[oldRouteID].endLoc.lat == parsedJSON.routes[i].endLoc.lat)
                    && (parsedJSON.routes[oldRouteID].endLoc.long == parsedJSON.routes[i].endLoc.long)) {
                    if ((parsedJSON.routes[i].startLoc.lat == parsedJSON.packets[minIndexPacket].initLocation.lat)
                        && (parsedJSON.routes[i].startLoc.long == parsedJSON.packets[minIndexPacket].initLocation.long)) {
                        newRouteIndex2 = i;
                    }
                }
            }
            parsedJSON.packets[minIndexPacket].state = 1;
            parsedJSON.couriers[minIndexCourier].packets.push(parsedJSON.packets[minIndexPacket]);
            var localOldRouteID = 0;
            /*for (var i = 0; i < parsedJSON.couriers[minIndexCourier].routes.length; i++) {
                if (parsedJSON.couriers[minIndexCourier].routes[i]._id == oldRouteID) {
                    localOldRouteID = i;
                }
            }*/


            //console.log("oldRouteID= ", oldRouteID);
            //console.log("newRouteIndex1= ", newRouteIndex1);
            //console.log("newRouteIndex2= ", newRouteIndex2);

            parsedJSON.couriers[minIndexCourier].remainingPieceCapacity = parsedJSON.couriers[minIndexCourier].remainingPieceCapacity - 1;
            parsedJSON.couriers[minIndexCourier].remainingWeightCapacity = parsedJSON.couriers[minIndexCourier].remainingWeightCapacity - parsedJSON.packets[minIndexPacket].weight;

            parsedJSON.routes[oldRouteID].state = 0;
            parsedJSON.routes[newRouteIndex1].state = 1;
            parsedJSON.routes[newRouteIndex2].state = 1;
            console.log("oldRouteID= ", oldRouteID);

            for (var i = 0; i < parsedJSON.couriers[minIndexCourier].routes.length; i++) {
                console.log("route id: ", parsedJSON.couriers[minIndexCourier].routes[i]._id);
            }
            //parsedJSON.couriers[minIndexCourier].routes.splice(localOldRouteID, 1, parsedJSON.routes[newRouteIndex1], parsedJSON.routes[newRouteIndex2]);
            parsedJSON.couriers[minIndexCourier].routes.splice(oldLocalRouteID, 1, parsedJSON.routes[newRouteIndex1], parsedJSON.routes[newRouteIndex2]);
            console.log("------");
            for (var i = 0; i < parsedJSON.couriers[minIndexCourier].routes.length; i++) {
                console.log("route id: ", parsedJSON.couriers[minIndexCourier].routes[i]._id);
            }
            console.log("============");
            //console.log(parsedJSON.couriers[minIndexCourier].routes.length);
        }
        else {
            console.log("cozum kalmadi");
        }
    }
    var totalDistance = 0;
    for (var i = 0; i < courierNumber; i++) {
        if (parsedJSON.couriers[i].routes.length == 1) {
            parsedJSON.couriers[i].routes[0].distance = 0;
            console.log("Courier No:", i, " is free today");

        } else {
            for (var j = 0; j < parsedJSON.couriers[i].routes.length; j++) {
                totalDistance = totalDistance + parsedJSON.couriers[i].routes[j].distance;
            }

        }
    }

    console.log("totalDistance= ", totalDistance);
    res.send(parsedJSON);


});

app.listen(3000);