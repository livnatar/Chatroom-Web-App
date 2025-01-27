var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const errorController = require('./controllers/error');
const sequelize = require('./models/index');

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const chatroomRouter = require('./routes/chatroom');
const apiRouter = require('./routes/chatroomApi');

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
// Enable sessions
app.use(session({
    secret: 'somesecretkey',
    //store: myStore, // default is memory store
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    cookie: { maxAge: 10 * 60 * 1000 } // milliseconds
}));

// Sync the session store
// myStore.sync();

app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash('msg');
  next();
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

// Middleware to check if the user is not logged in
const isNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        // If user is logged in, redirect to chatroom
        return res.redirect('/chatroom');
    }
    next(); // If not logged in, proceed to the next middleware/route
};


// Routes
app.use('/', chatroomRouter);

app.use('/api', apiRouter);

// Routes with middleware applied

app.use('/', isNotLoggedIn, loginRouter);
app.use('/register', isNotLoggedIn, registerRouter);

//maybe move the safe pages in the chatroom to other route to do middleware



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
