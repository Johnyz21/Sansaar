const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Email = require('../../config/email');
// var upload = multer({ dest: 'public/images/shop/' }).single('productImg');
const {
  check,
  validationResult
} = require('express-validator/check');
const Product = require('../../models/product');
const User = require('../../models/user');
const Event = require('../../models/event');
// const ProductRequest = require('../../models/productRequest');

var storage = multer.diskStorage({ //multers disk storage settings
  destination: function(req, file, cb) {
    cb(null, './public/images/shop/')
  },
  filename: function(req, file, cb) {
    var datetimestamp = Date.now();
    // cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    cb(null,file.originalname);
  }
});

var upload = multer({ //multer settings
  storage: storage,
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      req.flash('fileFormatError', 'File formats accepted: pngs, jpg, gifs and jpeg');
      console.log('--------MADNESS------');
      return callback(new Error('Only images are allowed'))
    }
    callback(null, true)
  },
  limits: {
    fileSize: 2000 * 1024
  }
}).single('productImg');

router.get('/', isLoggedIn, isAdmin, function(req, res, next) {
  // console.log(req.user);
  Promise.all([
    Product.find({}),
    Event.find({}).populate('applied verified user attending')
  ]).then(([products, events]) => {
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
      startDateError: req.flash('startDateError')
    });

  })
  // Product.find()
  //   .then(products =>{
  //
  //
  //       res.render('user/admin',
  //       { title: 'Admin',
  //       products : products,
  //       eventError: req.flash('eventError'),
  //       productError:req.flash('productError'),
  //       nameError: req.flash('nameError'),
  //       fileError: req.flash('fileError'),
  //        descriptionError: req.flash('descriptionError'),
  //        priceError: req.flash('priceError'),
  //        fileFormatError: req.flash('fileFormatError'),
  //        typeError : req.flash('typeError'),
  //         fileUploadError: req.flash('fileUploadError') });
  //
  //   });

  // Product.find(function(err, products){
  //   // console.log(products);
  //   res.render('user/admin', { title: 'Admin' , products : products,productError:req.flash('productError'), nameError: req.flash('nameError'), fileError: req.flash('fileError'), descriptionError: req.flash('descriptionError'), priceError: req.flash('priceError'),fileFormatError: req.flash('fileFormatError'), requiredError : req.flash('requiredError'), fileUploadError: req.flash('fileUploadError') });
  // });


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
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      req.flash('fileUploadError', err.message);
      multerError = true;
      console.log(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      req.flash('fileUploadError', 'An error occurred with the file');
      multerError = true;
      console.log(err);
    }

    let eventName = req.body.eventName;
    let description = req.body.description;
    let price = req.body.price;
    let file = req.file;
    let startDate = req.body.startDate;
    let endDate = req.body.endDate;
    let error = false;

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

      console.log('------EVENT------');

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
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        req.flash('fileUploadError', err.message);
        multerError = true;
        console.log(err);
      } else if (err) {
        // An unknown error occurred when uploading.
        req.flash('fileUploadError', 'An error occurred with the file');
        multerError = true;
        console.log(err);
      }

      let productName = req.body.productName;
      let description = req.body.description;
      let price = req.body.price;
      let file = req.file;
      let error = false;

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
          req.flash('success', 'Product added');
          // res.redirect('/shop');
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

router.post('/updateProduct/:id', isLoggedIn, isAdmin, [
  check('title').not().isEmpty().trim().escape().withMessage('Please enter a title'),
  check('price').not().isEmpty().trim().isNumeric().withMessage('Please enter a price')
], function(req,res,next){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.status(422).json({ errors: errors.array() });
    errors.array().forEach( error => {
      console.log(error.msg);
        req.flash('productError', error.msg);
    });

    res.redirect('/admin');
  } else {
    Product.update({
      _id: req.params.id
    }, {
      $set: {
        title: req.body.title,
        description : req.body.description,
        price: req.body.price
      }
    }, function(err, updatedEvent){
      if(err){
        //validation message
        console.log(err);
      }
      req.flash('success','Updated Product');
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
    errors.array().forEach( error => {
      console.log(error.msg);
        req.flash('eventError', error.msg);
    });


    res.redirect('/admin');
  } else {
    // var eventId = req.params.id;
    // var title = req.body.title;
    // var description = req.body.description;
    // var price = req.body.price;

    Event.update({
      _id: req.params.id
    }, {
      $set: {
        title: req.body.title,
        description : req.body.description,
        price: req.body.price
      }
    }, function(err, updatedEvent){
      if(err){
        //validation message
        console.log(err);
      }
      req.flash('success','Updated Event');
      res.redirect('/admin');
    });
  }



});

router.post('/authoriseUsersForEvent', function(req, res, next) {
  // console.log(req.body);
  var eventId = req.body.eventId;
  var eventTitle = req.body.eventTitle;
  var users = req.body.users;
  var usersEmail = req.body.usersEmail;

  console.log(eventId);
  console.log(users);

  Event.update({
    _id: eventId
  }, {
    // $addToSet: {
    //   verified: users
    // },
    // $pullAll: {
    //   applied: users
    // }
  }, function(err, updatedEvent) {
    // console.log(updatedEvent);
    if (err) {
      // Add flash error message
      console.log(err);

    }
    // console.log(users);
    // for(var user in users){
    //   console.log(user);
    //   Email.eventConfirmationEmail(user.email,updatedEvent.title);
    // }

    usersEmail.forEach( async (userEmail) => {
      // console.log(user);
      await Email.eventConfirmationEmail(userEmail,eventTitle);
    });

    res.redirect('/admin');
  });


  // var updateEvents = req.body.updateEvents;
  // var eventId = Object.keys(updateEvents);
  // // console.log(eventId);
  // for(var eventId in updateEvents){
  //   if (!updateEvents.hasOwnProperty(eventId)) continue;
  //
  //   if( updateEvents[eventId] instanceof Array){
  //     var users = updateEvents[eventId]
  //     users.forEach(function(userId){
  //       console.log(userId)
  //       // Update event ( with id: eventId), push the users 'verified' attribute of the event
  //       Event.update({ _id: eventId}, { $addToSet : { applied: users} });
  //     })
  //   } else {
  //     var user = updateEvents[eventId]
  //     // Single user
  //     console.log(user);
  //     // res.redirect('/admin');
  //     // Update event ( with id: eventId), push the user 'verified' attribute of the event
  //   }
  // }


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
