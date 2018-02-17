var express = require('express');
var app = express();

var parsedJSON = require('./db.json');
var math = require('mathjs');


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



/*
To create random couriers and packets.
To calculate all routes avaliable.
*/
app.get('/api/create', function (req, res) {

    var courierNumber = 3;
    var packetNumber = 5;

    for (var i = 0; i < courierNumber; i++) {
        var courier = {
            "_id": i,
            "initLocation": {
                "lat": 5 * i + 10,
                "long": 2 * i + 10
            },
            "curLocation": {
                "lat": 5 * i + 10,
                "long": 2 * i + 10
            },
            "weightCapacity": 20,
            "remainingWeightCapacity": 20,
            "pieceCapacity": 3,
            "remainingPieceCapacity": 3,
            "route": {},
            "packets": [
            ]
        };
        parsedJSON.couriers.push(courier);
    }

    for (var i = 0; i < packetNumber; i++) {
        var packet = {
            "_id": i,
            "initLocation": {
                "lat": 4 * i + 10,
                "long": 3 * i + 10
            },
            "destLocation": {
                "lat": 25,
                "long": 25
            },
            "weight": 20,
            "state": 0,
            "courier": {}
        };
        parsedJSON.packets.push(packet);
    }

    var routeID = 0;

    for (var i = 0; i < courierNumber; i++) {
        for (var j = 0; j < packetNumber; j++) {
            //var x = parsedJSON.couriers[courierNumber].initLocation.lat;

            var distanceBetweenPoints = math.distance([parsedJSON.couriers[i].initLocation.lat, parsedJSON.couriers[i].initLocation.long], [parsedJSON.packets[j].initLocation.lat, parsedJSON.packets[j].initLocation.long]);

            var route = {
                "_id": routeID,
                "routeFromGoogle": "",
                "distance": distanceBetweenPoints,
                "startLoc": parsedJSON.couriers[i].initLocation,
                "endLoc": parsedJSON.packets[j].initLocation
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
                "endLoc": parsedJSON.packets[j].initLocation
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
                "endLoc": parsedJSON.packets[i].destLocation
            };
            parsedJSON.routes.push(route);
            routeID++;
    }


    res.send(parsedJSON);
});

app.listen(3000);