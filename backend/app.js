var express = require('express');
var app = express();

var parsedJSON = require('./db.json');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    res.send('hello world');
});

app.get('/courierRouter', function (req, res) {



});

/*
Courier api
*/
app.get('/api/courier', function (req, res) {
    res.send(parsedJSON.couriers);
});

app.get('/api/courier/:id', function (req, res) {
    res.send(parsedJSON.couriers[req.params.id]);
});

/*
Packet api
*/
app.get('/api/packet', function (req, res) {
    res.send(parsedJSON.packets);
});

app.get('/api/packet/:id', function (req, res) {
    res.send(parsedJSON.packets[req.params.id]);
});


app.get('/api/create', function (req, res) {
    for (let i = 0; i < 3; i++) {
        var courier = {
            "_id": i,
            "initLocation": {
                "lat": 42.232,
                "long": 23.32
            },
            "curLocation": {
                "lat": 42.232,
                "long": 23.32
            },
            "loadCapacity": 20,
            "remainingCapacity": 20,
            "route": {},
            "packets": [
            ]
        };
        parsedJSON.couriers.push(courier);
    }

    for (let i = 0; i < 5; i++) {
        var packet = {
            "_id": "dsadqwdwqdwqdqwd",
            "initLocation": {
                "lat": 42.232,
                "long": 23.32
            },
            "destLocation": {
                "lat": 42.232,
                "long": 23.32
            },
            "weight": 20,
            "state": 0,
            "courier": {}
        };
        parsedJSON.packets.push(packet);
    }
    res.send(parsedJSON);
});

app.listen(3000);