var express = require('express');
var app = express();

var parsedJSON = require('./db.json');


app.get('/', function (req, res) {
    res.send('hello world');
});


/*
Courier api
*/
app.get('/api/courier', function (req, res) {
    res.send(parsedJSON.couriers);
});

/*
*/
app.get('/api/packet', function (req, res) {
    res.send(parsedJSON.packets);
});


app.listen(3000);