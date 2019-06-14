var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('home/index');
});

//Robots.txt
router.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: ");
});

router.get('/downloadLeaflet', function(req,res,next){
  var file = __dirname + '/../../public/pdfs/SansaarLeaflet.pdf';
  console.log(file);
  res.download(file,'SansaarLeaflet.pdf');

});

router.get('/downloadCancelationRefundPolicy', function(req,res,next){
  var file = __dirname + '/../../public/pdfs/CancellationRefundPolicy.pdf';
  console.log(file);
  res.download(file,'CancellationRefundPolicy.pdf');
})

module.exports = router;
