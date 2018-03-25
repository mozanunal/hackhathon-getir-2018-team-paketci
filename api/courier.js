var express = require('express');
var router = express.Router();

/* GET packet. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Courier' });
});

module.exports = router;
