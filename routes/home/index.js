var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('home/index');
});

router.get('/downloadLeaflet', function(req,res,next){
  var file = __dirname + '/../../public/pdfs/SansaarLeaflet.pdf';
  console.log(file);
  res.download(file,'SansaarLeaflet.pdf');

});

module.exports = router;
