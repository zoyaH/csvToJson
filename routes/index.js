var express = require('express');
var router = express.Router();
var main = require('../controllers/main');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'File convert' });
});

router.get('/api/convert/csv', main.convertCSV);

module.exports = router;
