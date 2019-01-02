const express = require('express');
const router = express.Router();
const passport = require('passport');
const csrf = require('csurf');
const csrfProtection = csrf();
const {
  check,
  validationResult
} = require('express-validator/check');
const Order = require('../../models/order');
const Cart = require('../../models/cart');
const User = require('../../models/user');
// const ProductRequest = require('../../models/productRequest');

router.use(csrfProtection);

router.get('/profile', isLoggedIn, function(req, res, next) {
  var errors = req.flash('error');
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
      orders: orders,
      csrfToken: req.csrfToken(),
      email: req.user.email,
      errors: errors,
      userId : req.user._id
    });
  });


  //
  // });
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

// router.get('/update',isLoggedIn, function(req,res,next){
//   console.log('Working');
//   res.redirect('/shoppingCart');
// });

router.post('/disableUser',isLoggedIn, function(req,res,next){

  User.update({
    _id:req.user._id
  }, {
    $set: {
      email : '',
      disabled: true
    }
  }, function(err, disabledUser){
    if(err){
      req.flash('error', 'Unable to delete account, please try again!');
      res.redirect('/user/profile');
    } else {

      res.redirect('/user/logout');
    }
  });
});

router.post('/updateProfile', isLoggedIn, [check('email').not().isEmpty().isEmail()], function(req, res, next) {

  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log('-------');
  console.log(req.user.id);
  User.update({
    _id: req.user._id
  }, {
    $set: {
      email: req.body.email,
    }
  }, function(err, updatedUser) {
    if (err) {
      console.log(err);
      res.redirect('/user/profile');
      req.flash('error', 'Unable to update your email address, please try again.');
    } else {
      console.log('Success')
      req.flash('success', 'Email updated!');
      res.redirect('/user');
    }
  });
})
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

router.get('/downloadPrivacyPolicy', function(req,res,next){
  var file = __dirname + '/../../public/policies/Privacy_Notice_Effective_25_May_2018.pdf';
  console.log(file);
  res.download(file,'Privacy_Notice_Effective_25_May_2018.pdf');

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
