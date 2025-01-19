var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const errorController = require('./controllers/error');

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');

const {get404} = require("./controllers/error");

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session and Flash middleware
app.use(
    session({
      secret: 'yourSecretKey', // Replace with a strong secret key
      resave: false,           // Prevents unnecessary session saving
      saveUninitialized: true, // Forces uninitialized sessions to be saved
      cookie: { secure: false } // Use `secure: true` only with HTTPS
    })
);

app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash('msg');
  next();
});

// Routes
app.use('/', loginRouter);
app.use('/register', registerRouter);

// Catch unknown routes (404 errors)
app.use(errorController.get404);


// Error handler (for other errors)
app.use((err, req, res, next) => {
  // Set locals to send error details, only for development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
