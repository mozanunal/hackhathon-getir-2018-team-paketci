var express = require('express');
var parsedJSON = require('./db.json');
var math = require('mathjs');
var pld = require('point-line-distance');
var bodyParser  = require('body-parser');

var app = express();
app.use(bodyParser.json());

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

var courierNumber = 10; 
var packetNumber = 50;

var map={
    "minLat": 40.726,
    "maxLat": 40.76,
    "minLong": -111.917 ,
    "maxLong": -111.83
}

app.post('/api/create', function (req, res) {
    console.log(req.body);
    if(req!=null) {
        res.set(req.body);
    }
});
/*
Create api
To create random couriers and packets.
To calculate all routes avaliable.
*/
app.get('/api/create', function (req, res) {
    /* Database reset */
    parsedJSON = {
        "couriers": [],
        "packets": [],
        "routes": [],
        "name": "Paketci APP"
    };

    /* Courier Creator */
    var weightCapacityPerCourier = 20;
    var pieceCapacityPerCourier = 8;
    randomMultiCourierCreator(parsedJSON.couriers, courierNumber, weightCapacityPerCourier, pieceCapacityPerCourier);

    /* Packet Creator */
    var destLocation = {
        "lat": randomRange(map.minLat, map.maxLat),
        "long": randomRange(map.minLong, map.maxLong)
    }
    randomMultiPacketCreator(parsedJSON.packets, packetNumber, destLocation);

    /* Route Creator */
    routeCreatorAll(parsedJSON, destLocation);

    /* Calculate minimum distance delta between route and any new double routes with packet */
    calculateAddingRouteValue(parsedJSON);

    res.send(parsedJSON);
});


/*
routeOptimize api
To create random couriers and packets.
To calculate all routes avaliable.
*/
app.get('/api/routeOptimize', function (req, res) {

    firstRouteAssign(parsedJSON);

    /* repeat optimize process for all package */
    for (var packetCounter = 0; packetCounter < packetNumber; packetCounter++) {
        /* Add the most optimize action for taking a package */
        var maxPossibleDistance = 1000000;
        var minRoute = {
            "min": maxPossibleDistance,
            "minIndexCourier": -1,
            "minIndexLocalRoute": -1,
            "minIndexPacket": -1,
        }
        minRoute = findMinRouteValueForPackages(parsedJSON, minRoute);
        findRoutesForMinRouteValueAndReplaceRoutes(parsedJSON, minRoute);
    }

    var totalDistance = calculateTotalDistance(parsedJSON.couriers)

    console.log("totalDistance= ", totalDistance);
    res.send(parsedJSON);


});

/**
 * To reset db to random test generate
 * 
 * @param {dbjson file} dbJson (global db json file)
 */
function dbReset(dbJson) {
    dbJson = {
        "couriers": [],
        "packets": [],
        "routes": [],
        "name": "Paketci APP"
    };
}


/**
 * To create multiple courier with common weightCapacity and pieceCapacity
 * 
 * @param {any} couriersArray  (couriers array input)
 * @param {any} couriersCount  (number of couriers which will create)
 * @param {any} weightCapacity (weight capacity for a courier in kg)
 * @param {any} pieceCapacity  (piece capacity for a courier, it can not be lower than one)
 */
function randomMultiCourierCreator(couriersArray, couriersCount, weightCapacity, pieceCapacity) {
    if (pieceCapacity < 1) {
        console.log("piece limit= ", pieceCapacity);
        console.log("please choose higher value ");
    }
    for (var i = 0; i < couriersCount; i++) {
        courierCreator(couriersArray, weightCapacity, pieceCapacity);
    }
}
/**
 * To create courier with weightCapacity and pieceCapacity
 * 
 * @param {any} couriersArray  (courier array input)
 * @param {any} weightCapacity (weight capacity for a courier in kg)
 * @param {any} pieceCapacity  (piece capacity for a courier, it can not be lower than one)
 */
function courierCreator(couriersArray, weightCapacity, pieceCapacity) {
    var loc = {
        "lat": randomRange(map.minLat, map.maxLat),
        "long": randomRange(map.minLong, map.maxLong)
    };
    var courier = {
        "_id": couriersArray.length,
        "initLocation": loc,
        "curLocation": loc,
        "weightCapacity": weightCapacity,
        "remainingWeightCapacity": weightCapacity,
        "pieceCapacity": pieceCapacity,
        "remainingPieceCapacity": pieceCapacity,
        "routes": [],
        "packets": []
    };
    couriersArray.push(courier);
}
/**
 * To create multi packet with random init location, common destination location and random wieght which creates between input values of weight
 * 
 * @param {any} packetsArray (packets array input)
 * @param {any} packetCount  (number of packets which will create)
 * @param {any} destLocation (common destination location for all packets)
 * @param {any} minWeight    (min weight for random weight creation of packets)
 * @param {any} maxWeight    (max weight for random weight creation of packets)
 */
function randomMultiPacketCreator(packetsArray, packetCount, destLocation, minWeight, maxWeight) {
    for (var i = 0; i < packetCount; i++) {
        var randomWeight = randomRange(minWeight, maxWeight);
        packetCreator(packetsArray, destLocation, randomWeight)
    }
}
/**
 * To create packet with a packet weight and a destination location
 * 
 * @param {any} packetsArray (packets array input)
 * @param {any} destLocation (destination location for new packet)
 * @param {any} packetWeight (weight of new packet)
 */
function packetCreator(packetsArray, destLocation, packetWeight) {
    var packet = {
        "_id": packetsArray.length,
        "initLocation": {
            "lat": randomRange(map.minLat, map.maxLat),
            "long": randomRange(map.minLong, map.maxLong)
        },
        "destLocation": destLocation,
        "weight": randomRange(1, 3),
        "state": 0,
        "courier": {}
    };
    packetsArray.push(packet);
}

/**
 * To create all routes which are avaliable
 * 
 * @param {any} db 
 * @param {any} destLocation 
 */
function routeCreatorAll(db, destLocation) {
    routeCreatorBetweenCourierAndDeliveryLocation(db, destLocation);
    routeCreatorBetweenCourierAndPacketLocation(db);
    routeCreatorBetweenPacketAndPacketLocation(db);
    routeCreatorBetweenPacketAndDestinationLocation(db);
}
/**
 * To create routes which are between couriers' start location to destinitaion location
 * 
 * @param {any} db (database which include couriers, routes, packets)
 * @param {any} destLocation (common destination location )
 */
function routeCreatorBetweenCourierAndDeliveryLocation(db, destLocation) {
    for (var i = 0; i < courierNumber; i++) {
        var distanceBetweenPoints = math.distance([db.couriers[i].initLocation.lat, db.couriers[i].initLocation.long],
            [db.packets[0].destLocation.lat, db.packets[0].destLocation.long]);
        var route = {
            "_id": db.routes.length,
            "routeFromGoogle": "",
            "distance": distanceBetweenPoints,
            "startLoc": db.couriers[i].initLocation,
            "endLoc": db.packets[0].destLocation,
            "nearPacketsDistance": [],
            "state": 0
        };
        db.routes.push(route);
    }
}
/**
 * To create routes which are between couriers' start location to packets' location
 * 
 * @param {any} db (database which include couriers, routes, packets)
 */
function routeCreatorBetweenCourierAndPacketLocation(db) {
    for (var i = 0; i < courierNumber; i++) {
        for (var j = 0; j < packetNumber; j++) {
            var distanceBetweenPoints = math.distance([db.couriers[i].initLocation.lat, db.couriers[i].initLocation.long],
                [db.packets[j].initLocation.lat, db.packets[j].initLocation.long]);
            var route = {
                "_id": db.routes.length,
                "routeFromGoogle": "",
                "distance": distanceBetweenPoints,
                "startLoc": db.couriers[i].initLocation,
                "endLoc": db.packets[j].initLocation,
                "nearPacketsDistance": [],
                "state": 0
            };
            db.routes.push(route);
        }
    }
}
/**
 * To create routes which are between packets' location to packets' location
 * 
 * @param {any} db (database which include couriers, routes, packets)
 */
function routeCreatorBetweenPacketAndPacketLocation(db) {
    for (var i = 0; i < packetNumber; i++) {
        for (var j = 0; j < packetNumber; j++) {
            //var x = parsedJSON.couriers[courierNumber].initLocation.lat;

            var distanceBetweenPoints = math.distance([db.packets[i].initLocation.lat, db.packets[i].initLocation.long],
                [db.packets[j].initLocation.lat, db.packets[j].initLocation.long]);

            var route = {
                "_id": db.routes.length,
                "routeFromGoogle": "",
                "distance": distanceBetweenPoints,
                "startLoc": db.packets[i].initLocation,
                "endLoc": db.packets[j].initLocation,
                "nearPacketsDistance": [],
                "state": 0
            };
            db.routes.push(route);
        }
    }
}
/**
 * To create routes which are between packets' location to packets' destination location
 * 
 * @param {any} db (database which include couriers, routes, packets)
 */
function routeCreatorBetweenPacketAndDestinationLocation(db) {
    for (var i = 0; i < packetNumber; i++) {
        var distanceBetweenPoints = math.distance([db.packets[i].initLocation.lat, db.packets[i].initLocation.long],
            [db.packets[i].destLocation.lat, db.packets[i].destLocation.long]);
        var route = {
            "_id": db.routes.length,
            "routeFromGoogle": "",
            "distance": distanceBetweenPoints,
            "startLoc": db.packets[i].initLocation,
            "endLoc": db.packets[i].destLocation,
            "nearPacketsDistance": [],
            "state": 0
        };
        db.routes.push(route);
    }
}
/**
 * To calculate extra distance value for adding package pickup
 * 
 * @param {any} (database which include couriers, routes, packets) 
 */
function calculateAddingRouteValue(db) {
    for (var i = 0; i < db.routes.length; i++) {
        for (var j = 0; j < packetNumber; j++) {
            var point = [db.packets[j].initLocation.lat, db.packets[j].initLocation.long, 0];
            var a = [db.routes[i].startLoc.lat, db.routes[i].startLoc.long, 0];
            var b = [db.routes[i].endLoc.lat, db.routes[i].endLoc.long, 0];

            var distance1 = math.distance([db.routes[i].startLoc.lat, db.routes[i].startLoc.long], [db.packets[j].initLocation.lat, db.packets[j].initLocation.long]);
            var distance2 = math.distance([db.routes[i].endLoc.lat, db.routes[i].endLoc.long], [db.packets[j].initLocation.lat, db.packets[j].initLocation.long]);

            var deltaDistance = - db.routes[i].distance + distance1 + distance2;

            db.routes[i].nearPacketsDistance.push(deltaDistance);
        }
    }
}
/**
 * To assign routes which are between couriers' start location to destination locations
 * Note: It must be done before optimizing routes
 * @param {any} (database which include couriers, routes, packets) 
 */
function firstRouteAssign(db) {
    for (var i = 0; i < db.couriers.length; i++) {
        db.couriers[i].routes.push(db.routes[i]);
        db.routes[i].state = 1;
    }
}
/**
 * To find minimum route value for a package which is not assigned
 * 
 * @param {any} db (database which include couriers, routes, packets) 
 * @param {any} minRoute 
 *              .min (minimum value of routes value in near packets distance of using routes)
 *              .minIndexCourier (index of courier for min value)
 *              .minIndexLocalRoute (index of route for min value)
 *              .minIndexPacket (index of packet for min value)
 * @returns (minRoute)
 */
function findMinRouteValueForPackages(db, minRoute) {
    for (var i = 0; i < db.couriers.length; i++) {
        for (var j = 0; j < db.couriers[i].routes.length; j++) {
            for (var k = 0; k < db.packets.length; k++) {
                if ((db.couriers[i].routes[j].nearPacketsDistance[k] < minRoute.min) && (db.couriers[i].routes[j].nearPacketsDistance[k] != -1)) {
                    if ((db.packets[k].weight < db.couriers[i].remainingWeightCapacity) && (db.couriers[i].remainingPieceCapacity > 0)) {
                        minRoute.min = db.couriers[i].routes[j].nearPacketsDistance[k];
                        minRoute.minIndexCourier = i;
                        minRoute.minIndexLocalRoute = j;
                        minRoute.minIndexPacket = k;
                    }
                }
            }
        }
    }
    return minRoute;
}

/**
 * To find routes for min route value and replace them with old route into courier
 * 
 * @param {any} db (database which include couriers, routes, packets) 
 * @param {any} minRoute 
 *              .min (minimum value of routes value in near packets distance of using routes)
 *              .minIndexCourier (index of courier for min value)
 *              .minIndexLocalRoute (index of route for min value)
 *              .minIndexPacket (index of packet for min value)
 * @returns (minRoute)
 */
function findRoutesForMinRouteValueAndReplaceRoutes(db, minRoute) {
    var newRouteIndex1 = -1;
    var newRouteIndex2 = -1;

    if (minRoute.minIndexLocalRoute != -1 && minRoute.minIndexCourier != -1) {
        var oldLocalRouteID = minRoute.minIndexLocalRoute;
        console.log("minIndexCourier= ", minRoute.minIndexCourier);
        console.log("minIndexLocalRoute= ", minRoute.minIndexLocalRoute);
        var oldRouteID = db.couriers[minRoute.minIndexCourier].routes[minRoute.minIndexLocalRoute]._id;
        for (var i = 0; i < db.routes.length; i++) {
            db.routes[i].nearPacketsDistance[minRoute.minIndexPacket] = -1;
            if ((db.routes[oldRouteID].startLoc.lat == db.routes[i].startLoc.lat)
                && (db.routes[oldRouteID].startLoc.long == db.routes[i].startLoc.long)) {
                if ((db.routes[i].endLoc.lat == db.packets[minRoute.minIndexPacket].initLocation.lat)
                    && (db.routes[i].endLoc.long == db.packets[minRoute.minIndexPacket].initLocation.long)) {
                    newRouteIndex1 = i;
                }
            }
            if ((db.routes[oldRouteID].endLoc.lat == db.routes[i].endLoc.lat)
                && (db.routes[oldRouteID].endLoc.long == db.routes[i].endLoc.long)) {
                if ((db.routes[i].startLoc.lat == db.packets[minRoute.minIndexPacket].initLocation.lat)
                    && (db.routes[i].startLoc.long == db.packets[minRoute.minIndexPacket].initLocation.long)) {
                    newRouteIndex2 = i;
                }
            }
        }

        db.packets[minRoute.minIndexPacket].state = 1;
        db.couriers[minRoute.minIndexCourier].packets.push(db.packets[minRoute.minIndexPacket]);
        var localOldRouteID = 0;

        console.log("oldRouteID= ", oldRouteID);
        console.log("newRouteIndex1= ", newRouteIndex1);
        console.log("newRouteIndex2= ", newRouteIndex2);

        db.couriers[minRoute.minIndexCourier].remainingPieceCapacity = db.couriers[minRoute.minIndexCourier].remainingPieceCapacity - 1;
        db.couriers[minRoute.minIndexCourier].remainingWeightCapacity = db.couriers[minRoute.minIndexCourier].remainingWeightCapacity - db.packets[minRoute.minIndexPacket].weight;

        db.routes[oldRouteID].state = 0;
        db.routes[newRouteIndex1].state = 1;
        db.routes[newRouteIndex2].state = 1;
        console.log("oldRouteID= ", oldRouteID);

        for (var i = 0; i < db.couriers[minRoute.minIndexCourier].routes.length; i++) {
            console.log("route id: ", db.couriers[minRoute.minIndexCourier].routes[i]._id);
        }
        db.couriers[minRoute.minIndexCourier].routes.splice(oldLocalRouteID, 1, db.routes[newRouteIndex1], db.routes[newRouteIndex2]);
        console.log("------");
        for (var i = 0; i < db.couriers[minRoute.minIndexCourier].routes.length; i++) {
            console.log("route id: ", db.couriers[minRoute.minIndexCourier].routes[i]._id);
        }
        console.log("============");
        //console.log(parsedJSON.couriers[minIndexCourier].routes.length);
    }
    else {
        console.log("cozum kalmadi");
    }
    return minRoute
}
/**
 * To calculate distance for courier
 * 
 * @param {any} couriersArray (courier array input)
 * @returns (distance for courier)
 */
function calculateDistanceForCourier(couriersArray) {
    var distanceCourier = 0
    for (var i = 0; i < couriersArray.routes.length; i++) {
        distanceCourier = distanceCourier + couriersArray.routes[i].distance;
    }
    return distanceCourier;
}
/**
 * To calculate total distance for couriers
 * 
 * @param {any} couriersArray (courier array input)
 * @returns (total distance for couriers)
 */
function calculateTotalDistance(couriersArray) {
    var totalDistance = 0;
    for (var i = 0; i < couriersArray.length; i++) {
        totalDistance = totalDistance + calculateDistanceForCourier(couriersArray[i]);
    }
    return totalDistance;
}

/**
 * To create random float number between min and max inputs
 * 
 * @param {any} min (min value of random number)
 * @param {any} max (max value of random number)
 * @returns 
 */
function randomRange(min, max) {
    return (min + (max - min) * Math.random());
}

app.listen(3000);