var express = require('express');
var app = express();

var parsedJSON = require('./db.json');
var math = require('mathjs');
var pld = require('point-line-distance');

function randomRange(min, max) {
    return ~~(Math.random() * (max - min + 1)) + min
}

app.all('/*', function(req, res, next) {
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
var packetNumber = 5;

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
            "pieceCapacity": 3,
            "remainingPieceCapacity": 3,
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
            "weight": 20,
            "state": 0,
            "courier": {}
        };
        parsedJSON.packets.push(packet);
    }

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

    for (var packetIndex = 0; packetIndex < packetNumber; packetIndex++) {
        var maxPossibleDistance = 1000000;
        var min = maxPossibleDistance;
        var minIndexCourier = -1;
        var minIndexRoute = -1;
        var minIndexPacket = -1;

        for (var i = 0; i < courierNumber; i++) {
            for (var j = 0; j < parsedJSON.couriers[i].routes.length; j++) {
                for (var k = 0; k < packetNumber; k++) {
                    console.log("nearPacketsDistanceIndex = ", k, "routes = ", j, "couriers= ", i);
                    console.log(parsedJSON.couriers[i].routes[j].nearPacketsDistance[k]);
                    if ((parsedJSON.couriers[i].routes[j].nearPacketsDistance[k] < min) && (parsedJSON.couriers[i].routes[j].nearPacketsDistance[k] != -1)) {
                        min = parsedJSON.couriers[i].routes[j].nearPacketsDistance[k];
                        minIndexCourier = i;
                        minIndexRoute = j;
                        minIndexPacket = k;
                    }
                }

            }
        }
        console.log("minIndexCourier= " + minIndexCourier + "  minIndexRoute= " + minIndexRoute + "  minIndexPacket= " + minIndexPacket);

        var newRouteIndex1 = -1;
        var newRouteIndex2 = -1;
        var oldRouteID = parsedJSON.couriers[minIndexCourier].routes[minIndexRoute]._id;

        for (var i = 0; i < parsedJSON.routes.length; i++) {
            parsedJSON.routes[i].nearPacketsDistance[minIndexPacket] = -1;
            if ((parsedJSON.routes[minIndexRoute].startLoc.lat == parsedJSON.routes[i].startLoc.lat) && (parsedJSON.routes[minIndexRoute].startLoc.long == parsedJSON.routes[i].startLoc.long)) {
                for (var j = 0; j < parsedJSON.packets.length; j++) {
                    if ((parsedJSON.routes[i].endLoc.lat == parsedJSON.packets[j].initLocation.lat)
                        && (parsedJSON.routes[i].endLoc.long == parsedJSON.packets[j].initLocation.long)) {
                        newRouteIndex1 = i;
                    }
                }
            }
            if (parsedJSON.routes[minIndexRoute].endLoc == parsedJSON.routes[i].endLoc) {
                for (var j = 0; j < parsedJSON.packets.length; j++) {
                    if (parsedJSON.routes[i].startLoc = parsedJSON.packets[j].initLocation) {
                        newRouteIndex2 = i;
                    }
                }
            }
        }
        parsedJSON.couriers[minIndexCourier].packets.push(parsedJSON.packets[minIndexPacket]);
        parsedJSON.packets[minIndexPacket].state = 1;

        parsedJSON.couriers[minIndexCourier].routes.splice(oldRouteID, 1, parsedJSON.routes[newRouteIndex1], parsedJSON.routes[newRouteIndex2]);
        parsedJSON.routes[oldRouteID].state = 0;
        parsedJSON.routes[newRouteIndex1].state = 1;
        parsedJSON.routes[newRouteIndex2].state = 1;
        console.log(parsedJSON.couriers[minIndexCourier].routes.length);
    }

    res.send(parsedJSON);


});

app.listen(3000);