const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const officegen = require('officegen');
const Email = require('../../config/email');
const CustomStorage = require('../../config/customMulterStorage');
// var upload = multer({ dest: 'public/images/shop/' }).single('productImg');
const {
  check,
  validationResult
} = require('express-validator/check');
const Product = require('../../models/product');
const User = require('../../models/user');
const Event = require('../../models/event');


// const ProductRequest = require('../../models/productRequest');

// var storage = multer.diskStorage({ //multers disk storage settings
//   destination: function(req, file, cb) {
//     cb(null, './public/images/shop/')
//   },
//   filename: function(req, file, cb) {
//     var datetimestamp = Date.now();
//     // cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
//     cb(null,file.originalname);
//   }
// });

var storage = CustomStorage({
  destination: function(req, file, cb) {
    // console.log(file);
    cb(null, './public/images/shop/' + file.originalname)
  }
});

var upload = multer({ //multer settings
  storage: storage,
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      req.flash('fileFormatError', 'File formats accepted: pngs, jpg, gifs and jpeg');
      // console.log('--------MADNESS------');
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 2000 * 1024
  }
}).single('productImg');


/* Error Messages are like this because (at the moment of creating this), body parser didn't work with Multer*/
router.get('/', isLoggedIn, isAdmin, function(req, res, next) {
  // console.log(req.user);
  Promise.all([
    Product.find({}),
    Event.find({}).populate('applied verified user attending')
  ]).then(([products, events]) => {
    // console.log(events);
    res.render('user/admin', {
      title: 'Admin',
      event: {},
      events: events,
      products: products,
      success: req.flash('success'),
      eventError: req.flash('eventError'),
      productError: req.flash('productError'),
      nameError: req.flash('nameError'),
      fileError: req.flash('fileError'),
      descriptionError: req.flash('descriptionError'),
      priceError: req.flash('priceError'),
      fileFormatError: req.flash('fileFormatError'),
      fileUploadError: req.flash('fileUploadError'),
      endDateError: req.flash('endDateError'),
      startDateError: req.flash('startDateError'),
      authoriseEventSuccess: req.flash('authoriseEventSuccess'),
      authoriseEventError: req.flash('authoriseEventError')

    });

  });

});
router.get('/getEvent/:id', isLoggedIn, isAdmin, function(req, res, next) {
  var eventId = req.params.id;
  Promise.all([
    Event.findById(eventId).populate('applied'),
  ]).then(([event]) => {
    res.render('partials/admin/eventRequestTable', {
      layout: false,
      event: event
    });
  })
});

router.post('/newEvent', isLoggedIn, isAdmin, function(req, res, next) {
  upload(req, res, function(err) {
    var multerError = false;
    let error = false;
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      req.flash('fileUploadError', err.message);
      multerError = true;
      console.log(err);
      error = true;
    } else if (err) {
      // An unknown error occurred when uploading.
      req.flash('fileUploadError', 'An error occurred with the file');
      multerError = true;
      error = true;
      console.log(err);
    }

    let eventName = req.body.eventName;
    let description = req.body.description;
    let price = req.body.price;
    let file = req.file;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;


    if (!endDate) {
      req.flash('endDateError', 'Please enter a end date');
      error = true;
    }
    if (!startDate) {
      req.flash('startDateError', 'Please enter a start date');
      error = true;
    }
    if (!eventName) {
      req.flash('nameError', 'Please enter a event name');
      error = true;
    }
    if (!description) {
      req.flash('descriptionError', 'Please enter a description');
      error = true;
    }
    if (!file) {
      if (multerError) {} else {
        req.flash('fileError', 'Please enter a file ');
      }
      error = true;
    }
    if (!price) {
      req.flash('priceError', 'Please enter a price');
      error = true;
    }
    if (price < 0) {
      req.flash('priceError', 'The price must be greater than 0');
      error = true;
    }
    if (error) {
      req.flash('productError', 'The event was not saved');
      // res.redirect('/admin');
      res.render('partials/admin/addEvents', {
        layout: false,
        success: req.flash('success'),
        eventError: req.flash('eventError'),
        productError: req.flash('productError'),
        nameError: req.flash('nameError'),
        fileError: req.flash('fileError'),
        descriptionError: req.flash('descriptionError'),
        priceError: req.flash('priceError'),
        fileFormatError: req.flash('fileFormatError'),
        fileUploadError: req.flash('fileUploadError'),
        endDateError: req.flash('endDateError'),
        startDateError: req.flash('startDateError')
      });
    } else {

      // console.log('------EVENT------');

      var event = new Event({
        imagePath: '/images/shop/' + req.file.filename,
        title: eventName,
        description: description,
        price: price,
        startDate: startDate,
        endDate: endDate
      });

      event.save(function(err, result) {
        if (err) {
          req.flash('eventError', 'The event was not added');
          // res.redirect('/admin');
          res.render('partials/admin/addEvents', {
            layout: false,
            success: req.flash('success'),
            eventError: req.flash('eventError'),
            productError: req.flash('productError'),
            nameError: req.flash('nameError'),
            fileError: req.flash('fileError'),
            descriptionError: req.flash('descriptionError'),
            priceError: req.flash('priceError'),
            fileFormatError: req.flash('fileFormatError'),
            fileUploadError: req.flash('fileUploadError'),
            endDateError: req.flash('endDateError'),
            startDateError: req.flash('startDateError')
          });
        }
        req.flash('success', 'Event added');
        res.render('partials/admin/addEvents', {
          layout: false,
          success: req.flash('success'),
          eventError: req.flash('eventError'),
          productError: req.flash('productError'),
          nameError: req.flash('nameError'),
          fileError: req.flash('fileError'),
          descriptionError: req.flash('descriptionError'),
          priceError: req.flash('priceError'),
          fileFormatError: req.flash('fileFormatError'),
          fileUploadError: req.flash('fileUploadError'),
          endDateError: req.flash('endDateError'),
          startDateError: req.flash('startDateError')
        });
      });

    }
  });

});
router.post('/newProduct', isLoggedIn, isAdmin,
  function(req, res, next) {

    // Uncomment below
    upload(req, res, function(err) {
      var multerError = false;
      let error = false;
      // console.log(req.file);
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        req.flash('fileUploadError', err.message);
        multerError = true;
        error = true;
        console.log(err);
      } else if (err) {
        // An unknown error occurred when uploading.
        req.flash('fileUploadError', 'An error occurred with the file');
        multerError = true;
        error = true;
        console.log(err);
      }

      let productName = req.body.productName;
      let description = req.body.description;
      let price = req.body.price;
      let file = req.file;


      if (!productName) {
        req.flash('nameError', 'Please enter a product name');
        error = true;
      }
      if (!description) {
        req.flash('descriptionError', 'Please enter a description');
        error = true;
      }
      if (!file) {
        if (multerError) {} else {
          req.flash('fileError', 'Please enter a file ');
        }
        error = true;
      }
      if (!price) {
        req.flash('priceError', 'Please enter a price');
        error = true;
      }
      if (price < 0) {
        req.flash('priceError', 'The price must be greater than 0');
        error = true;
      }
      if (error) {
        req.flash('productError', 'The product was not saved');
        // res.redirect('/admin');
        res.render('partials/admin/addProducts', {
          layout: false,
          success: req.flash('success'),
          eventError: req.flash('eventError'),
          productError: req.flash('productError'),
          nameError: req.flash('nameError'),
          fileError: req.flash('fileError'),
          descriptionError: req.flash('descriptionError'),
          priceError: req.flash('priceError'),
          fileFormatError: req.flash('fileFormatError'),
          fileUploadError: req.flash('fileUploadError'),
          endDateError: req.flash('endDateError'),
          startDateError: req.flash('startDateError')
        });
      } else {

        var product = new Product({
          imagePath: '/images/shop/' + req.file.filename,
          title: productName,
          description: description,
          price: price
        });

        //Save product
        product.save(function(err, result) {
          if (err) {
            req.flash('productError', 'The product was not added');
            // res.redirect('/admin');
            res.render('partials/admin/addProducts', {
              layout: false,
              success: req.flash('success'),
              eventError: req.flash('eventError'),
              productError: req.flash('productError'),
              nameError: req.flash('nameError'),
              fileError: req.flash('fileError'),
              descriptionError: req.flash('descriptionError'),
              priceError: req.flash('priceError'),
              fileFormatError: req.flash('fileFormatError'),
              fileUploadError: req.flash('fileUploadError'),
              endDateError: req.flash('endDateError'),
              startDateError: req.flash('startDateError')
            });
          }
          req.flash('success', 'Product added');
          // res.redirect('/shop');
          res.render('partials/admin/addProducts', {
            layout: false,
            success: req.flash('success'),
            eventError: req.flash('eventError'),
            productError: req.flash('productError'),
            nameError: req.flash('nameError'),
            fileError: req.flash('fileError'),
            descriptionError: req.flash('descriptionError'),
            priceError: req.flash('priceError'),
            fileFormatError: req.flash('fileFormatError'),
            fileUploadError: req.flash('fileUploadError'),
            endDateError: req.flash('endDateError'),
            startDateError: req.flash('startDateError')
          });
        });

      }
    });
  });

router.post('/updateProduct/:id', isLoggedIn, isAdmin, [
  check('title').not().isEmpty().trim().escape().withMessage('Please enter a title'),
  check('price').not().isEmpty().trim().isNumeric().withMessage('Please enter a price')
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(422).json({ errors: errors.array() });
    errors.array().forEach(error => {
      console.log(error.msg);
      req.flash('productError', error.msg);
    });

    res.redirect('/admin');
  } else {
    var disabled = req.body.disabled ? true : false;
    Product.update({
      _id: req.params.id
    }, {
      $set: {
        title: req.body.title,
        description: req.body.description,
        price: req.body.pricel,
        disabled: disabled
      }
    }, function(err, updatedEvent) {
      if (err) {
        //validation message
        console.log(err);
      }
      req.flash('success', 'Updated Product');
      res.redirect('/admin');
    });

  }
});

router.post('/updateEvent/:id', isLoggedIn, isAdmin, [
  check('title').not().isEmpty().trim().escape().withMessage('Please enter a title'),
  check('price').not().isEmpty().trim().isNumeric().withMessage('Please enter a price')
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(422).json({ errors: errors.array() });
    errors.array().forEach(error => {
      console.log(error.msg);
      req.flash('eventError', error.msg);
    });


    res.redirect('/admin');
  } else {
    // var eventId = req.params.id;
    // var title = req.body.title;
    // var description = req.body.description;
    // var price = req.body.price;

    var disabled = req.body.disabled ? true : false;

    Event.update({
      _id: req.params.id
    }, {
      $set: {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        disabled: disabled
      }
    }).exec((updatedEvent) => {
      console.log(updatedEvent);
      req.flash('success', 'Updated Event');
      res.redirect('/admin');

    }, (error) => {
      req.flash('eventError', 'Error occurred updating event');
      res.redirect('/admin');
    });
  }



});

router.post('/authoriseUsersForEvent',isLoggedIn, isAdmin, function(req, res, next) {
  // console.log(req.body);
  var eventId = req.body.eventId;
  var eventTitle = req.body.eventTitle;
  var userIds = req.body.userIds;

  User.find({
    '_id': {
      $in: userIds

    }

  }).then((users) => {

    var usersEmail = [];

    users.forEach((user) => {
      usersEmail.push(user.email)
    });

    Event.update({
      _id: eventId
    }, {
      $addToSet: {
        verified: users
      },
      $pullAll: {
        applied: users
      }
    }, function(err, updatedEvent) {
      // console.log(updatedEvent);
      if (err) {
        // Add flash error message
        req.flash('authoriseEventError', 'Unable to update event.')
        res.redirect('/admin');
        // console.log(err);
      }

      Email.eventConfirmationEmail(usersEmail, eventTitle).then((resolve) => {

        // console.log(resolve);
        req.flash('authoriseEventSuccess', 'Successfully notified user(s) by email');
        res.redirect('/admin');
      }, (error) => {
        // console.log(error);
        req.flash('authoriseEventError', 'Event updated. Unable to email: ' + error + ', please do so manually.')
        res.redirect('/admin');
      });


    });

  }).catch((errors) => {
    req.flash('eventError', 'Error occurred updating event');
    res.redirect('/admin');
  });
});
// router.post('/updateProductRequests', function(req,res,next){
//
//   var action = req.body.action;
//   var productRequests = req.body.products;
//
//   console.log(req.body);
//   if(action.toLowerCase() === 'confirm'){
//     console.log('Confirming all the records');
//     console.log(Object.keys(productRequests));
//     ProductRequest.updateMany(
//       { _id: Object.keys(productRequests) },
//       {$set: { approved: true} }, function(err,raw){
//         if(err){
//           console.log(err)
//         }
//         console.log(raw);
//         res.redirect('/admin');
//       });
//   } else if ( action.toLowerCase() === 'delete'){
//     console.log('Deleting all the records');
//   }
//
//   // res.redirect('/admin');
// });

router.post('/attendeesDetails/:id',isLoggedIn, isAdmin, function(req, res, next) {

  var eventId = req.params.id;
  // Promise.all([
  //   Event.findById(eventId).populate('applied'),
  // ])
  Event.findById(eventId).populate('attending').then(event => {
    var docx = officegen('docx');
    docx.setDocSubject('...');
    docx.setDescription('Attendee Details');


    for(var i = 0; i < event.attending.length; i++){
      let pObj = docx.createP ();
      console.log(event.attending[i]);
      let userDetails = event.attending[i]
      pObj.addText ( 'Name: ' + userDetails.firstName + ' ' + userDetails.middleName + ' '+ userDetails.surname, { bold: true, underline: false, font_size: 15 } );
      pObj.addLineBreak ();
      pObj.addText('D.O.B.', {font_size:12, bold: true});
      pObj.addText( userDetails.dob.toLocaleString('en-GB'), {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Gender: ', {font_size:12, bold: true});
      pObj.addText(  userDetails.gender, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Passport Number: ', {font_size:12, bold: true});
      pObj.addText(''+ userDetails.passportNumber, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Passport Expiry: ', {font_size:12, bold: true});
      pObj.addText( userDetails.passportExpiry.toLocaleString('en-GB'), {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Mobile Number: ', {font_size:12, bold: true});
      pObj.addText( ''+ userDetails.mobileNumber, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Email: ', {font_size:12, bold: true});
      pObj.addText(  userDetails.email, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Emergency Contact: ', {font_size:12, bold: true});
      pObj.addText(userDetails.emergencyContactName, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Emergency Contact Relationship: ', {font_size:12, bold: true});
      pObj.addText(userDetails.emergencyContactRelationship, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Emergency Contact Phone: ', {font_size:12, bold: true});
      pObj.addText( ' ' + userDetails.emergencyContactPhone, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Emergency Email Number: ', {font_size:12, bold: true});
      pObj.addText( userDetails.emergencyContactEmail, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Travel Independently: ', {font_size:12, bold: true});
      pObj.addText( ''+ userDetails.travelIndependently, {font_size: 12 });
      pObj.addLineBreak ();
      pObj.addText('Dietary Resitrctions: ', {font_size:12, bold: true});
      pObj.addText(userDetails.dietaryRestrictions, {font_size: 12 });
      pObj.addHorizontalLine ();
    }
    // console.log(event);
    // console.log(event.attending);
    res.writeHead(200, {
      "Content-Type": "application/vnd.openxmlformats-officedocument.documentml.document",
      'Content-disposition': 'attachment; filename=eventAttendence.docx'
    });
    docx.generate(res);

  },
(error) => {
  req.flash('eventError', 'Error downloading attendee details');
  res.redirect('/admin');
});
});
module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function isAdmin(req, res, next) {

  if (req.user.admin) {
    return next();
  }

  res.redirect('/');
}
