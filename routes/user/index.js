const express = require('express');
const router = express.Router();
const passport = require('passport');
const csrf = require('csurf');
const csrfProtection = csrf();
const Order = require('../../models/order');
const Cart = require('../../models/cart');
// const ProductRequest = require('../../models/productRequest');

router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {

  Promise.all([
    Order.find({
      user: req.user
    })
  ]).then(([orders]) => {

    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    res.render('user/profile', {
      orders: orders,  csrfToken: req.csrfToken()
    });
  });

  // Order.find({
  //   user: req.user
  // }, function(err, orders) {
  //   if (err) {
  //     // Couldnt load orders handle properly
  //     res.render('user/profile');
  //     return res.write('Errors');
  //   }
  //   var cart;
  //   orders.forEach(function(order) {
  //     cart = new Cart(order.cart);
  //     order.items = cart.generateArray();
  //   });
  //   res.render('user/profile', {
  //     orders: orders
  //   });
  // });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

// router.get('/admin', isLoggedIn, isAdmin, function (req,res,next){
//   console.log(req.user);
//   Product.find(function(err, products){
//     // console.log(products);
//     res.render('user/admin', { title: 'Admin' , products : products});
//   });
//
//
// });
/* router.use targets all requests
Placed infront of all the routes where the user does not need to be logged in */
router.use('/', notLoggedIn, function(req, res, next) {
  next();
});

router.get('/signup', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signUp', {
    csrfToken: req.csrfToken(),
    messages: messages
  });
});

router.post('/signup', passport.authenticate('local.signup', {
  failureRedirect: '/user/signup',
  failureFlash: true
}), function(req, res, next) {
  if (req.session.previousUrl) {
    var prevUrl = req.session.previousUrl;
    req.session.previousUrl = null;
    res.redirect(prevUrl);
  } else {
    res.redirect('/user/profile');
  }
});



router.get('/signIn', function(req, res, next) {
  var messages = req.flash('error');
  res.render('user/signIn', {
    csrfToken: req.csrfToken(),
    messages: messages
  });
});

router.post('/signIn', passport.authenticate('local.signin', {
  failureRedirect: '/user/signIn',
  failureFlash: true
}), function(req, res, next) {
  if (req.session.previousUrl) {
    var prevUrl = req.session.previousUrl;
    req.session.previousUrl = null;
    res.redirect(prevUrl);
  } else {
    res.redirect('/user/profile');
  }
});



module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
// function isAdmin(req,res,next){
//
//     if(req.user.admin){
//       return next();
//     }
//
//   res.redirect('/');
// }
