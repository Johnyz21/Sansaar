// Passport uses the same instance app wide
const passport = require('passport');
const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
  done(null,user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true

}, function(req, email, password, done){

  req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid Password').notEmpty().isLength({min:4});
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false , req.flash('error',messages) );
  }

  User.findOne({'email' : email}, function(err,user){
    if(err){
      return done(err);
    }
    if(user){
      return done(null, false, {message: 'Email already in use.'});
    }
    var newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    newUser.save(function(err,result){
      if(err){
        return done(err);
      }
      return done(null, newUser);
    });
  });
}));

passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){

  req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid Password').notEmpty();
  var errors = req.validationErrors();
  if(errors){
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false , req.flash('error',messages) );
  }
  User.findOne({'email' : email, 'disabled':false}, function(err,user){
    if(err){
      return done(err);
    }
    if(!user){
      return done(null, false, {message: 'User not found'});
    }
    console.log("---------");
    console.log(user);
    if(!user.validPassword(password)){
        return done(null, false, {message: 'Invalid password'});
    }
    return done(null, user)
  });
}));
