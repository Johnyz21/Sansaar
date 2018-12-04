const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const session = require('express-session');

const home = require('./routes/home/index');
const shop = require('./routes/shop/index');
const user = require('./routes/user/index');
const admin = require('./routes/admin/index');
const passport = require('passport');
const flash = require('connect-flash');
const validator = require('express-validator');
const MongoStore = require('connect-mongo')(session);
const helmet = require('helmet')
var app = express();

mongoose.connect('mongodb://localhost:27017/shopping' , { useNewUrlParser: true });
require('./config/passport');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'khgu1234rahil123jdbgiueaflndsajfas',
  resave: false ,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  /* Session is alive for 60 minutes ( 1 hour ), accepts miliseconds */
  cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  /* Sets global variable*/
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  res.locals.admin =  ( req.user == null ) ? false : (req.user.admin == null ? false : req.user.admin);
  next();
});

app.use('/',home);
app.use('/shop',shop);
app.use('/user',user);
app.use('/admin',admin);
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist/umd'));
app.use('/js', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/js'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/webfonts', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/webfonts'));
app.use('/css', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/css'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
