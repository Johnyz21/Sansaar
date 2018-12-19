const express = require('express');
const router = express.Router();
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const paypal = require('paypal-rest-sdk');
const paypalHelper = require('../../config/paypalHelper');
const Order = require('../../models/order');
const Event = require('../../models/event');
const Email = require('../../config/email');
const EventRegistrationDetails = require('../../models/eventRegistrationDetails');
const {
  check,
  validationResult
} = require('express-validator/check');
// const ProductRequest = require('../../models/productRequest');
/* GET users listing. */

paypal.configure({
  /* Jonnys Sandbox */
  // 'mode': 'sandbox',
  // 'client_id': 'AVCZeYrCux3K7_R-c9sx9Eq9V2NcxKmVw-h9-Zk6c-8MMq-JnMJxMZhlu_m9kTQw62sZSAH1CSlYrcHe',
  // 'client_secret': 'ECL880EkDN_WKC9nvXrjlmZ3fi7GckEFiRoT0Zp23GwSzOFkhlSHFLH19TfbeCSirk2ok0LOTSG9787A'
  'mode': 'live',
  'client_id': 'AdUxHKkkpm4x7X8pX-qdEf963Jdy35imPo0qHIl3We8k8GDnwBs4-422FJuQtR4-E68vw4GM4c6r1MlE',
  'client_secret': 'EBG5kxrWvHBxhPmqME7mAHhR4zLaMhC9VwPHnIt836ihDzcoxARWvP_WKqS8VrMwxU3vOM0zlrPRUggT'
});

router.get('/', function(req, res, next) {

  var successMessage = req.flash('success')[0];
  var errorMessage = req.flash('errors')[0];

  Product.find(function(err, products) {
    // console.log(products);
    res.render('shop/products', {
      title: 'Products',
      products: products,
      errorMessage: errorMessage,
      noErrors: !errorMessage,
      successMessage: successMessage,
      noMessages: !successMessage
    });
  });

  // res.render('shop/index', { title: 'Shop' , products : products });
});

router.get('/events', function(req, res, next) {
  var successMessage = req.flash('success')[0];
  var errorMessage = req.flash('errors')[0];

  Event.find({}, function(err, events) {

    if (req.isAuthenticated()) {
      res.render('shop/events', {
        title: 'Events',
        events: events,
        errorMessage: errorMessage,
        noErrors: !errorMessage,
        successMessage: successMessage,
        noMessages: !successMessage,
        userId: req.user._id
      });
    } else {
      res.render('shop/events', {
        title: 'Events',
        events: events,
        errorMessage: errorMessage,
        noErrors: !errorMessage,
        successMessage: successMessage,
        noMessages: !successMessage
      });
    }
  });
});

router.get('/addProductToCart/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product) {
    if (err) {
      // Show some error message, cant add to cart
      req.flash('errors','Error occurred adding to cart, please try again');
      res.redirect('/shop');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/shop');
  });
});

router.get('/eventRegistration/:id', isLoggedIn, function(req, res, next) {
  var eventId = req.params.id;

  Event.findOne({
    _id: eventId,
    verified: {
      $in: [req.user]
    }
  }).exec().then( (event) => {

        if (event) {
          res.render('shop/eventRegistration', {
            eventId: event._id,
            eventTitle: event.title,
            errors: req.flash('errors')
          });
        } else {
          req.flash('errors', 'You are not authorised for this event');
          res.redirect('/shop/events');
        }


  }, (error) => {
    req.flash('errors', 'An error occurred, please try again');
    res.redirect('/shop/events');
  });

});

router.post('/purchaseEvent/:id', isLoggedIn, [check('firstName').not().isEmpty().withMessage('Please enter a first name'),
  check('surname').not().isEmpty().withMessage('Please enter a surname'),
  check('dob').not().isEmpty().withMessage('Please enter a DOB'),
  check('gender').not().isEmpty().withMessage('Please enter a gender'),
  check('passportNumber').not().isEmpty().withMessage('Please enter a passport number'),
  check('passportExpiry').not().isEmpty().withMessage('Please enter a passport expiry date'),
  check('phoneNumber').not().isEmpty().withMessage('Please enter a phone number'),
  check('mobileNumber').not().isEmpty().withMessage('Please enter a mobile number'),
  // check('faxNumber').not().isEmpty().withMessage('Please enter a fax number'),
  check('permanentEmail').not().isEmpty().withMessage('Please enter a permanent email'),
  check('emergencyContactName').not().isEmpty().withMessage('Please enter a emergency name'),
  check('emergencyContactRelationship').not().isEmpty().withMessage('Please enter the relationship you share with your emergency contact'),
  check('emergencyContactPhone').not().isEmpty().withMessage('Please enter your emergency contacts phone number'),
  check('emergencyContactEmail').not().isEmpty().withMessage('Please enter your emergency contacts email'),
  check('travelIndependently').not().isEmpty().withMessage('Please declare your independent status'),
  // check('dietaryRestrictions').not().isEmpty().withMessage('Please enter your dietary requirements'),
], function(req, res, next) {

  var eventId = req.params.id;
  var eventTitle = req.body.eventTitle;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  console.log(eventId);
  console.log(req.body);

  var errors = validationResult(req);
  if (errors.isEmpty()) {

    var registrationDetails = new EventRegistrationDetails({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      surname: req.body.surname,
      dob: req.body.dob,
      gender: req.body.gender,
      passportNumber: req.body.passportNumber,
      passportExpiry: req.body.passportExpiry,
      mobileNumber: req.body.mobileNumber,
      faxNumber: req.body.faxNumber,
      email: req.body.permanentEmail,
      emergencyContactName: req.body.emergencyContactName,
      emergencyContactRelationship: req.body.emergencyContactRelationship,
      emergencyContactPhone: req.body.emergencyContactPhone,
      emergencyContactEmail: req.body.emergencyContactEmail,
      travelIndependently: req.body.travelIndependently,
      dietaryRestrictions: req.body.dietaryRestrictions
    });


    //Get event
    Event.findOne({
      _id: eventId,
      verified: {
        $in: [req.user]
      }
    }).exec().then( (event) => {

          if (event) {

            var eventPaypalPaymentJson = paypalHelper.eventPaypalPaymentJson(event);

            //Go to paypal to make payment
            paypal.payment.create(eventPaypalPaymentJson, function(error, payment) {
              if (error) {
                // Error sending paypal JSON
                console.log("error creating payment, normally to do with JSON")
                console.log(error.response.details);
                req.flash('errors', 'Trouble connecting with paypal, please try again');
                res.redirect("/shop/events");
                // throw error;
              } else {

                req.session.eventRegistrationDetails = registrationDetails;
                req.session.eventPrice = event.price;
                req.session.eventId = event._id;

                for (let i = 0; i < payment.links.length; i++) {
                  if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                  }
                }
              }
            });

          } else {
            req.flash('errors', 'You are not authorised for this event');
            res.redirect('/shop/events');
          }


    }, (error) => {
      req.flash('errors', 'An error occurred, please try again');
      res.redirect('/shop/events');
    });



    // res.redirect('shop/eventRegistration');
  } else {
    console.log('Errors');
    console.log(errors.array());
    req.flash('errors', errors.array());
    // res.render('shop/eventRegistration',{eventId : eventId, eventTitle: eventTitle});
    res.redirect('/shop/eventRegistration/' + eventId);
  }
});

router.get('/reduceItemQty/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shop/shoppingCart');
});

router.get('/increaseItemByOne/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.increaseByOne(productId);
  req.session.cart = cart;
  res.redirect('/shop/shoppingCart');
});

router.get('/removeItem/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shop/shoppingCart');
});

router.get('/eventSignup/:id', function(req, res, next) {
  var eventId = req.params.id;
  var user = req.user;
  Event.update({
    _id: eventId
  }, {
    $addToSet: {
      applied: req.user
    }
  }, function(err, success) {
    if (err) {
      req.flash('error', 'An error occurred, please try again');
      res.redirect("/shop/events");
    } else {
      req.flash('success', 'You have been successfully registered, please wait for an email confirmation upon approval of your request.')
      res.redirect("/shop/events");
    }
  });

});
router.get('/shoppingCart', function(req, res, next) {

  var errorMessage = req.flash('error')[0];

  if (!req.session.cart) {
    return res.render('shop/shoppingCart', {
      title: 'Shopping Cart',
      products: null,
      errorMessage: errorMessage,
      noError: !errorMessage
    });
  }
  var cart = new Cart(req.session.cart);
  // console.log(cart);
  // console.log(cart.generateArray());
  // Email.emailOrder('fake', cart);
  res.render('shop/shoppingCart', {
    title: 'Shopping Cart',
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
    errorMessage: errorMessage,
    noError: !errorMessage
  });

});

router.get('/checkout', isLoggedIn, function(req, res, next) {
  if (!req.session.cart) {
    return res.redirect('shoppingCart');
  }
  var cart = new Cart(req.session.cart);
  var paypalPaymentJson = paypalHelper.cartPaypalPaymentJson(cart);

  paypal.payment.create(paypalPaymentJson, function(error, payment) {
    if (error) {
      // Error sending paypal JSON
      console.log("error creating payment, normally to do with JSON")
      console.log(error.response.details);
      req.flash('error', 'Trouble connecting with paypal, please try again');
      res.redirect("/shop/shoppingCart");
      // throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

  // res.render('shop/checkout', { total : cart.totalPrice});

});

router.get('/successfulEventPayment', function(req, res, next) {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const eventId = req.session.eventId;
  const eventPrice = req.session.eventPrice;

  const eventRegistrationDetails = new EventRegistrationDetails(req.session.eventRegistrationDetails);
  var executePaypalPaymentJson = paypalHelper.createPaypalExecutePaymentJson(payerId, eventPrice);

  // console.log(req.query);
  // console.log(eventRegistrationDetails);

  paypal.payment.execute(paymentId, executePaypalPaymentJson, function(error, payment) {
    if (error) {
      // Error with transaction please try again
      console.log(error.response);
      req.flash('errors', 'Error occured with paypal, please try again');
      res.redirect("/shop/events");
      // throw error;
    } else {

      // Save registration details
      eventRegistrationDetails.save().then( (savedDetails) => {

        // Update event with registration details (only works if logged in user has been verified)
        return Event.findOneAndUpdate({
          _id: eventId,
          verified: {
            $in: [req.user]
          }
        }, {
          $push: {
            attending: savedDetails
          }
        }).exec() }).then((event) => {

          // Create new order item, add event to cart -> single order with 1 item
          var cart = new Cart({});
          cart.add(event, eventId);

          var order = new Order({
            user: req.user,
            cart: cart,
            address: payment.payer.payer_info.shipping_address,
            name: payment.payer.payer_info.shipping_address.recipient_name,
            paymentId: payment.id

          });
          console.log(order);

          return order.save();
        }).catch((error) =>{
          req.flash('errors', 'Event not updated, but payment has been accepted. Please contact us quoting your paypal payment id:' + payment.id);
          res.redirect("/shop/events");
          req.session.eventRegistrationDetails = null;
          req.session.eventPrice = null;
          req.session.eventId = null;
        })

        .then((order) => {

          // Send email out about event
          Email.emailOrder(req.user.email, order);

        })
        .catch((error) => {
          req.flash('errors', 'Error occurred sending confirmation email, please contact us and quote your paypal payment id :' + payment.id);
        })
        .then(() => {

          req.flash('success', 'Transaction complete, thank you for your purchase');
          res.redirect('/shop/events');
          // Remove following from session
          req.session.eventRegistrationDetails = null;
          req.session.eventPrice = null;
          req.session.eventId = null;
        });




    }
  });

});
router.get('/successfulCartPayment', function(req, res, next) {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  var cart = new Cart(req.session.cart);
  var executePaypalPaymentJson = paypalHelper.createPaypalExecutePaymentJson(payerId, cart.totalPrice);
  // const executePayment =
  paypal.payment.execute(paymentId, executePaypalPaymentJson, function(error, payment) {
    if (error) {
      // Error with transaction please try again
      console.log(error.response);
      req.flash('error', 'Error occured with paypal, please try again');
      res.redirect("/shop/shoppingCart");
      // throw error;
    } else {
      //Save details and that

      var order = new Order({
        user: req.user,
        cart: cart,
        address: payment.payer.payer_info.shipping_address,
        name: payment.payer.payer_info.shipping_address.recipient_name,
        paymentId: payment.id

      });

      Promise.all([
        order.save(),
        Email.emailOrder(req.user.email, order)

      ]).then(() => {
        req.flash('success', 'Successfully bought products');
        req.session.cart = null;
        res.redirect('/shop');
      }).catch((err) => {
        console.log(err);
        req.flash('error', 'Error handling order, please contact us to check if the order went through');
        res.redirect('/shop/shoppingCart');
      })
    }
  });

});

// router.get('/requestProduct/:id', isLoggedIn, (req,res) => {
//   var productRequest = new ProductRequest({
//     user : req.user,
//     product : req.params.id,
//     approved :  false,
//     claimed : false
//   });
//   console.log('Working');
//   productRequest.save(function(err,result){
//     if(err){
//       req.flash('error','Error occurred during requesting service ');
//       res.redirect('/shop/shoppingCart');
//     }
//     req.flash('success','Successfully requested');
//     res.redirect('/shop');
//   });
// });
router.get('/cancelPayment', (req, res) => {
  req.flash('error', 'Payment cancelled by user');
  res.redirect('/shop/shoppingCart');
});

function eventNamesInCart(cart) {
  var eventNames = []
  for (key in cart.items) {
    if (!cart.items.hasOwnProperty(key)) continue;
    var item = cart.items[key];
    // console.log(item)
    for (var prop in item) {
      // skip loop if the property is from prototype
      if (!item.hasOwnProperty(prop)) continue;
      if (item[prop].verified) {
        console.log('-------EVENT ------')
        // console.log(item[prop]);
        eventNames.push(item[prop].title);
        console.log(item[prop].title)
      }
    }
  }
  return eventNames;
}

// function eventIdsInCart(cart){
//   var eventIds = []
//   for(key in cart.items){
//     if (!cart.items.hasOwnProperty(key)) continue;
//     var item = cart.items[key];
//     // console.log(item)
//     for (var prop in item) {
//         // skip loop if the property is from prototype
//         if(!item.hasOwnProperty(prop)) continue;
//         if(item[prop].verified){
//           console.log('-------EVENT ------')
//           // console.log(item[prop]);
//           eventIds.push(item[prop]._id);
//         }
//     }
//   }
//   return eventIds;
// }
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.previousUrl = req.baseUrl + req.url;
  console.log(req.session.previousUrl);
  res.redirect('/user/signIn');
}

module.exports = router;
