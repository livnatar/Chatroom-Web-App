const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const errorController = require('./controllers/error');
const sequelize = require('./models/index');

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const chatroomRouter = require('./routes/chatroom');
const apiRouter = require('./routes/chatroomApi');
const chatroomPagesRouter = require('./routes/chatroomPages');
const {get404} = require("./controllers/error");

const app = express();

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
  res.locals.messages = req.flash('msg')|| [];
  res.locals.foundMessages =  req.flash('foundMessages')|| [];
  res.locals.query = req.flash('query') || '';

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


// Routes
app.use('/', chatroomRouter);
app.use('/api', apiRouter);
app.use('/chatroom', chatroomPagesRouter);
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
