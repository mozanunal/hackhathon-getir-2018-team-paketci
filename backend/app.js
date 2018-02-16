var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.send('Index page');
});

router.use('/api/courier', require('./api/courier').router);
router.use('/api/packet', require('./api/packet').router);

module.exports.router = router;