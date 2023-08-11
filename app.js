var createError = require('http-errors');
var express = require('express');
var hbs = require('hbs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

require('dotenv/config');

var indexRouter = require('./routes/index.js');
var restaurantsRouter = require('./routes/restaurants.js'); 
var restaurantsFrontRouter = require('./routes/restaurant-front.js');  
var restaurantsOverviewRouter = require('./routes/restaurant-overview.js');  
var restaurantsReviewsRouter = require('./routes/restaurant-reviews.js'); 
var restaurantsMenuRouter = require('./routes/restaurant-menu.js');  
var restaurantsPhotosRouter = require('./routes/restaurant-photos.js');  
var searchFoodRouter = require('./routes/search-food.js'); 
var searchReviewsRouter = require('./routes/search-reviews-results.js'); 
var filterRestosRouter = require('./routes/filter-restaurants.js'); 
var registerLoginRouter = require('./routes/registerorlogin.js');
var userProfileRouter = require('./routes/user-profile.js');

var app = express();

hbs.registerPartials(path.join(__dirname, 'views/partials'), (err) => {});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(session({
  secret: 'foo',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 3600000 }, 
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/restaurants', restaurantsRouter); 
app.use('/restaurant-front', restaurantsFrontRouter); 
app.use('/restaurant-overview', restaurantsOverviewRouter); 
app.use('/restaurant-reviews', restaurantsReviewsRouter); 
app.use('/restaurant-menu', restaurantsMenuRouter); 
app.use('/restaurant-photos', restaurantsPhotosRouter); 
app.use('/search-food', searchFoodRouter); 
app.use('/filter-restaurants', filterRestosRouter); 
app.use('/search-reviews-results', searchReviewsRouter); 
app.use('/registerorlogin', registerLoginRouter); 
app.use('/user-profile', userProfileRouter);  

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('.env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect(process.env.MONGODB_URI, {dbName: process.env.DB_NAME})
.then( ()=> {
    console.log('DB Connected!');
  })
  .catch( (err) => {
    console.log(err);
});

module.exports = app;