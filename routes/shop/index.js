const express = require('express');
const router = express.Router();
const Product = require('../../models/product');
const Cart = require('../../models/cart');
const paypal = require('paypal-rest-sdk');
const paypalHelper = require('../../config/paypalHelper');
const Order = require('../../models/order');
const Event = require('../../models/event');
const Email = require('../../config/email');
// const ProductRequest = require('../../models/productRequest');
/* GET users listing. */

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AVCZeYrCux3K7_R-c9sx9Eq9V2NcxKmVw-h9-Zk6c-8MMq-JnMJxMZhlu_m9kTQw62sZSAH1CSlYrcHe',
  'client_secret': 'ECL880EkDN_WKC9nvXrjlmZ3fi7GckEFiRoT0Zp23GwSzOFkhlSHFLH19TfbeCSirk2ok0LOTSG9787A'
});

router.get('/',  function (req, res, next) {
    var successMessage = req.flash('success')[0];

    // Promise.all([
    //   Product.find({}),
    //   Event.find({})
    // ]).then( ( [products,events] ) => {
    //   console.log('done');
    //   if(req.isAuthenticated()){
    //     res.render('shop/index', { title: 'Shop' , products : products,events: events, successMessage : successMessage, noMessages: !successMessage, userId: req.user._id });
    //   } else {
    //     res.render('shop/index', { title: 'Shop' , products : products,events: events, successMessage : successMessage, noMessages: !successMessage});
    //   }
    //
    // })

    Product.find(function(err, products){
      // console.log(products);
      res.render('shop/products', { title: 'Products' , products : products, successMessage : successMessage, noMessages: !successMessage });
    });

    // res.render('shop/index', { title: 'Shop' , products : products });
});

router.get('/events',  function (req, res, next) {
    var successMessage = req.flash('success')[0];


      Event.find({}, function(err, events){

        if(req.isAuthenticated()){
          res.render('shop/events', { title: 'Events' ,events: events, successMessage : successMessage, noMessages: !successMessage, userId: req.user._id });
        } else {
          res.render('shop/events', { title: 'Events' ,events: events, successMessage : successMessage, noMessages: !successMessage});
        }
      });
});
router.get('/addProductToCart/:id', function(req,res,next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product){
    if(err){
      // Show some error message, cant add to cart
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    // console.log(req.session.cart);
    console.log(req.baseUrl);
    res.redirect('/shop');
    // res.redirect(req.baseUrl + req.url);
  });
});

router.get('/addEventToCart/:id', function(req,res,next){
  var eventId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Event.findById(eventId, function(err, event){
    if(err){
      // Show some error message, cant add to cart
      return res.redirect('/');
    }
    cart.add(event, event.id);
    req.session.cart = cart;
    // console.log(req.session.cart);
    console.log(req.baseUrl);
    res.redirect('/shop/events');
    // res.redirect(req.baseUrl + req.url);
  });
});

router.get('/reduceItemQty/:id', function(req,res,next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shop/shoppingCart');
});

router.get('/increaseItemByOne/:id', function(req,res,next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.increaseByOne(productId);
  req.session.cart = cart;
  res.redirect('/shop/shoppingCart');
});

router.get('/removeItem/:id', function(req,res,next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shop/shoppingCart');
});

router.get('/eventSignup/:id', function(req,res,next){
  var eventId = req.params.id;
  var user = req.user;
  Event.update(
    { _id: eventId},
    { $addToSet : { applied: req.user} }, function(err, success){
      if(err){
        console.log(err);

        res.redirect('/shop')
      } else {
        req.flash('success','You have been successfully registered, please wait for an email confirmation upon approval of your request.')
        res.redirect('/shop')
      }
    }
  );

});
router.get('/shoppingCart', function(req,res,next){

  var errorMessage = req.flash('error')[0];

  if(!req.session.cart){
    return res.render('shop/shoppingCart', { title: 'Shopping Cart', products: null, errorMessage : errorMessage, noError: !errorMessage});
  }
  var cart = new Cart(req.session.cart);
  // console.log(cart);
  // console.log(cart.generateArray());
  // Email.emailOrder('fake', cart);
  res.render('shop/shoppingCart', {title: 'Shopping Cart',products: cart.generateArray(), totalPrice: cart.totalPrice, errorMessage : errorMessage, noError: !errorMessage});

});

router.get('/checkout',isLoggedIn, function(req,res,next){
  if(!req.session.cart){
    return res.redirect('shoppingCart');
  }
  var cart = new Cart(req.session.cart);
  // console.log(cart.generateArray())

  var paypalPaymentJson = paypalHelper.createPaypalPaymentJson(cart);

  console.log(paypalPaymentJson);
  // var eventIds = []
  // for(key in cart.items){
  //   if (!cart.items.hasOwnProperty(key)) continue;
  //   var item = cart.items[key];
  //   console.log(item)
  //   for (var prop in item) {
  //       // skip loop if the property is from prototype
  //       if(!item.hasOwnProperty(prop)) continue;
  //       if(item[prop].verified){
  //         console.log('-------EVENT ------')
  //         console.log(item[prop]);
  //         eventIds.push(item[prop]._id);
  //       }
  //   }
  // }
  // console.log(eventIds);

  paypal.payment.create(paypalPaymentJson, function (error, payment) {
      if (error) {
          // Error sending paypal JSON
          console.log("error creating payment, normally to do with JSON")
          console.log(error.response.details);
          req.flash('error', 'Trouble connecting with paypal, please try again');
          res.redirect("/shop/shoppingCart");
          // throw error;
      } else {
        for(let i = 0; i < payment.links.length; i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
      }
  });

  // res.render('shop/checkout', { total : cart.totalPrice});

});

router.get('/successfulPayment', function(req,res,next) {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  var cart = new Cart(req.session.cart);
  var executePaypalPaymentJson = paypalHelper.createPaypalExecutePaymentJson(payerId, cart.totalPrice);
  // const executePayment =
  paypal.payment.execute(paymentId, executePaypalPaymentJson, function (error, payment) {
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
        // console.log(order.address);
        // console.log(JSON.stringify(payment));

        var eventIds = eventIdsInCart(cart);
        console.log(eventIdsInCart(cart).length == 0 ? false : true);

        // Note the IF statement
        // eventIdsInCart(cart).length == 0 ?
        Promise.all([
          order.save(),
          Event.update(
            { _id: { $in: eventIds }},
            { $addToSet : { attending: req.user} }
          ),
          Email.emailOrder(req.user.email, order)
          // Email.eventConfirmationEmail(req.user.email,eventNamesInCart(cart))

        ]).then(() => {
          req.flash('success','Successfully bought products');
          req.session.cart = null;
          res.redirect('/shop');
        }).catch((err) => {
          console.log(err);
          req.flash('error','Error handling order, please contact us to check if the order went through');
          res.redirect('/shop/shoppingCart');
        })



        // order.save(function(err,result){
        //   if(err){
        //     req.flash('error','Error handling order, please contact us to check if the order went through');
        //     res.redirect('/shop/shoppingCart');
        //   }
        //   req.flash('success','Successfully bought products');
        //   req.session.cart = null;
        //   res.redirect('/shop');
        // });

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
router.get('/cancelPayment', (req,res) => {
  req.flash('error','Payment cancelled by user');
  res.redirect('/shop/shoppingCart');
});

function eventNamesInCart(cart){
  var eventNames = []
  for(key in cart.items){
    if (!cart.items.hasOwnProperty(key)) continue;
    var item = cart.items[key];
    // console.log(item)
    for (var prop in item) {
        // skip loop if the property is from prototype
        if(!item.hasOwnProperty(prop)) continue;
        if(item[prop].verified){
          console.log('-------EVENT ------')
          // console.log(item[prop]);
          eventNames.push(item[prop].title);
          console.log(item[prop].title)
        }
    }
  }
  return eventNames;
}

function eventIdsInCart(cart){
  var eventIds = []
  for(key in cart.items){
    if (!cart.items.hasOwnProperty(key)) continue;
    var item = cart.items[key];
    // console.log(item)
    for (var prop in item) {
        // skip loop if the property is from prototype
        if(!item.hasOwnProperty(prop)) continue;
        if(item[prop].verified){
          console.log('-------EVENT ------')
          // console.log(item[prop]);
          eventIds.push(item[prop]._id);
        }
    }
  }
  return eventIds;
}
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.session.previousUrl = req.baseUrl + req.url;
  console.log(req.session.previousUrl);
  res.redirect('/user/signIn');
}

module.exports = router;
