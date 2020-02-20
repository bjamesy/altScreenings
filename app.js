require('dotenv').config();

const createError = require('http-errors');
const express     = require('express');
const path        = require('path');
const logger      = require('morgan');
const schedule    = require('node-schedule');
const { deleteSeeds } = require('./db/seedQueries');
const { 
  getRoyal, 
  getParadise, 
  getRevue,
  getHotDocs,
  getRegent,
  getTiff,
  getCinesphere
} = require('./seeds/seed');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// SEED DB from web scrapes 
// ** 3 times a day **
const rule = new schedule.RecurrenceRule();
rule.hour = [3, 7, 16];

const seedSched = schedule.scheduleJob(rule, () => {
  async function seedDB() {
    try {
      // remove seeding
      await deleteSeeds();
      // begin seeding
      await getCinesphere();
      await getRegent();
      await getTiff();
      await getRoyal();
      await getParadise();
      await getRevue();
      await getHotDocs();  
    } catch(err) {
      console.log(err);
    }
  };
seedDB();
});
seedSched;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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