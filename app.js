require('dotenv').config();

const createError      = require('http-errors');
const express          = require('express');
const path             = require('path');
const engine           = require('ejs-mate');
const logger           = require('morgan');
const session          = require('express-session');
const methodOverride   = require('method-override');
const indexRouter      = require('./routes/index');
const usersRouter      = require('./routes/users');

const app = express();

// CONFIG sessions ! 
app.use(session({
  secret: "we the north",
  resave: false,
  saveUninitialized: true,
}));

// schedule SCRAPING 3 times per day
// cron.schedule('* 2,7,14 * * *', () => {
//   console.log('CRON JOB !');
//   seedDB;
// });

// schedule TWILIO updates 
// cron.schedule('* 10 * * *', () => {
//   dailyUpdate();
// });

app.use(function(req, res, next) {
  // set default page title
  res.locals.title = 'PTST';
  // SUCCESS flash message in header
  res.locals.success = req.session.success || '';
  delete req.session.success;
  // ERROR flash message in header
  res.locals.error = req.session.error || '';
  delete req.session.error;
  next();
})

// use ejs-locals for all ejs templates:n
app.engine('ejs', engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  console.log(err);
  req.session.error = err.message;
  res.redirect('back');
});

module.exports = app;