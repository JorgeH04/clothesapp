if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} 

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const multer = require('multer');

const MongoStore = require('connect-mongo')(session);
// Initializations
const app = express();
require('./database');
require('./passport/passport');



//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    //helpers: require('./helpers'),
    extname: '.hbs'
  }));
  app.set('view engine', '.hbs');
  app.use(multer({dest: path.join(__dirname, '/public/upload/temp')}).single('image'));


//var upload = multer({ storage: storage }).fields([
//  {name: 'file1'},
//  {name: 'file2'},
//  {name: 'file3'}

//])


// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));


// middlewares

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection}),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
})

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

// routes
app.use(require('./routes'));
app.use(require('./routes/users'));
app.use(require('./routes/babyclothes'));
app.use(require('./routes/vlargos'));
app.use(require('./routes/remeras'));
app.use(require('./routes/vcortos'));


// server
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});