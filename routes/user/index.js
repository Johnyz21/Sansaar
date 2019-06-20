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
const crypto = require('crypto');
const Email = require('../../config/email');
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
      userId: req.user._id
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

router.post('/disableUser', isLoggedIn, function(req, res, next) {

  User.update({
    _id: req.user._id
  }, {
    $set: {
      email: '',
      disabled: true
    }
  }, function(err, disabledUser) {
    if (err) {
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

router.get('/downloadPrivacyPolicy', function(req, res, next) {
  var file = __dirname + '/../../public/policies/Privacy_Notice_Effective_25_May_2018.pdf';
  console.log(file);
  res.download(file, 'Privacy_Notice_Effective_25_May_2018.pdf');

});

router.get('/forgotPassword', function(req, res, next) {
  var messages = req.flash('error');

  res.render('user/forgotPassword', {
    csrfToken: req.csrfToken(),
    messages: messages,
    emailError: req.flash('emailError'),
    resetSuccess: req.flash('resetSuccess')
  });

});

router.post('/forgotPassword', function(req, res, next) {
  var messages = {};
  // Promise.all([
  new Promise(function(resolve, reject) {
    crypto.randomBytes(20, function(err, buf) {
      var token = buf.toString('hex');
      // done(err, token);
      if (err) {
        reject(err)
      };
      resolve(token);
    });

  }).then(token => {
    return new Promise(function(resolve, reject) {
      User.findOne({
        email: req.body.email
      }, function(err, user) {
        if (!user || user == null) {
          console.log('Error!')
          req.flash('emailError', 'No account with that email address exists.');
          reject('User account does not exist');
        } else {
          console.log('No Error')
          console.log(user)

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            // done(err, token, user);
            if (err) reject('Error with user')
            resolve(user);
          });
          // console.log(user);

        }

      });
    })


  }).then(user => {
    console.log(user);
    Email.emailPasswordReset(user.email, user.resetPasswordToken, req.headers.host);
  }).then(() => {
    req.flash('resetSuccess', 'An email has been sent with password reset instructions')
    res.render('user/forgotPassword', {
      csrfToken: req.csrfToken(),
      messages: messages,
      emailError: req.flash('emailError'),
      resetSuccess: req.flash('resetSuccess')
    });
  }).catch(error => {
    // req.flash('errorReset', 'An error occurred resetting your password, please try again later');
    console.log(error)
    res.render('user/forgotPassword', {
      csrfToken: req.csrfToken(),
      messages: messages,
      emailError: req.flash('emailError'),
      resetSuccess: req.flash('resetSuccess')
    });

  })
});

router.get('/resetPassword/:token', function(req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function(err, user) {
    if (!user || user == null) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/user/forgotPassword');
    }
    res.render('user/resetPassword', {
      csrfToken: req.csrfToken(),
      token: req.params.token,
      messages: req.flash('messages'),
      success: req.flash('success'),
    });
  });
});

router.post('/resetPassword', [
  check('password').not().isEmpty().withMessage('Please enter a password'),
  check('password').isLength({min:4}).withMessage('Password must be at least 4 characters long'),
  check('confirmedPassword').not().isEmpty().withMessage('Please confirm your password'),
  check('confirmedPassword').custom((value, {req }) => {
  if (value !== req.body.password) {
    // req.flash('error', 'Confirmed Password does not match the password field');
    throw new Error('Password confirmation does not match password');
  }
  return true;
}),

], function(req, res) {
  // Error checking that pw matches confirmed pw

  new Promise(function(resolve,reject){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      errors.array().forEach(error => {
        req.flash('messages', error.msg);
      });
      reject(errors)
    }
    resolve()
  }).then( function() {
    return new Promise(function(resolve, reject) {
      User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function(err, user) {
        if (!user || user == null) {
          console.log(user)
          console.log(req.body.token);
          console.log('----Error---')
          req.flash('messages', 'Password reset token is invalid or has expired.');
          reject('Password reset token is invalid or has expired.')
        } else {
          console.log('Resets user & saves')
          user.password = user.encryptPassword(req.body.password);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          console.log(user.password)
          user.save(function(err) {});
          resolve(user.email)
        }

      });
    })
  }).then((userEmail) => {
    req.flash('success', 'Password has been reset')
    return res.render('user/resetPassword', {
      csrfToken: req.csrfToken(),
      messages: req.flash('messages'),
      success: req.flash('success'),
      token: req.params.token
    });
  }).catch(error => {
    console.log(error);
    return res.render('user/resetPassword', {
      csrfToken: req.csrfToken(),
      messages: req.flash('messages'),
      success: req.flash('success'),
      token: req.body.token
    });
  })

})
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
