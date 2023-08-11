var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var schemas = require('../models/restaurantModel');
var reviewSchemas = require('../models/reviewModel');
var commentSchemas = require('../models/commentModel');
var userSchemas = require('../models/userModel');

const formatDateISO = require('../helpers/formatISODate');

var bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {

         var links = [
             {linkTitle:"Home", link: "/"},
             {linkTitle:"Restaurants", link: "/restaurants"},
             {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
         ]; 
         res.render('registerorlogin', {
             title: "TaftFinds - Register/Login",
             links: links,
         });
}); 

router.get('/:id', function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    let restaurants = schemas.restaurants;


    restaurants.findOne({_id:id}).then((LoginData) => {
         var links = [
             {linkTitle:"Home", link: "/"},
             {linkTitle:"Restaurants", link: "/restaurants"},
             {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
         ]; 
     
         LoginData = LoginData;

         res.render('registerorlogin', {
             title: "TaftFinds - Register/Login",
             links: links,
             LoginData: LoginData
         });
 })
}); 

router.post('/registered/:id',  async function(req, res, next) {

   var id = new mongoose.Types.ObjectId(req.params.id);

   var links = [
    {linkTitle:"Home", link: "/"},
    {linkTitle:"Restaurants", link: "/restaurants"},
    {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 


    let restaurants = schemas.restaurants;

    let OrigRegisteredData;

    restaurants.findOne({_id:id}).then((RegisteredData) => {
        OrigRegisteredData = RegisteredData;
    });

    const { username, password, confirm_password, description, image } = req.body;

    if (password !== confirm_password) {
        const errorMessage = 'Passwords do not match, please register again.';
        res.render('registerorlogin', {
            title: "TaftFinds - Register/Login",
            message: errorMessage,
            redirectUrl: `/registerorlogin/${id}`,
            links: links,
            OrigRegisteredData: OrigRegisteredData
        });
        return;
    }

    try {
        const existingUser = await userSchemas.users.findOne({ username: username });
        if (existingUser) {
            const errorMessage = 'Username already exists, please choose a different username.';
            res.render('registerorlogin', {
                title: "TaftFinds - Register/Login",
                message: errorMessage,
                redirectUrl: `/registerorlogin/${id}`,
                links: links,
                OrigRegisteredData: OrigRegisteredData 
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userSchemas.users({
            _id: new mongoose.Types.ObjectId(),
            username: username,
            password: hashedPassword, 
            description: description,
            avatar: "avatars/" + image,
            no_of_reviews: 0
          });
          
        await newUser.save();

        const successMessage = 'Account registered successfully! You can now log-in.';

        res.render('registerorlogin', {
            title: "TaftFinds - Register/Login",
            message: successMessage,
            redirectUrl: `/registerorlogin/${id}`, 
            links: links,
            OrigRegisteredData: OrigRegisteredData
        });

    } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
    }
}); 

router.post('/login/:id',  async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);
 
    var links = [
     {linkTitle:"Home", link: "/"},
     {linkTitle:"Restaurants", link: "/restaurants"},
     {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
     ]; 
 
 
     const restaurants = schemas.restaurants;
     const restaurantReviews = reviewSchemas['restaurant-reviews'];
     const reviewComments = commentSchemas['reviews-comments'];
 
     let restoReviewsdata;

     restaurants.findOne({_id:id}).then((LogInData) => {
        restoReviewsdata = LogInData;
     });
 
     const allReviews = await restaurantReviews.aggregate([
        {
          $match: { restaurant_id: id }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $sort: { rating: -1 }
        },
        {
          $project: {
            _id: 1,
            title: 1,
            body: 1,
            rating: 1,
            review_images: 1,
            review_videos: 1,
            review_keywords: 1,
            helpful_no: 1,
            unhelpful_no: 1,
            comments_no: 1,
            positive: 1,
            reviewId: '$_id',
            userName: '$userDetails.username',
            userAvatar: '$userDetails.avatar',
            userId: '$userDetails._id',
            date_posted_formatted: {
              $function: {
                body: formatDateISO,
                args: ['$date_posted'],
                lang: 'js'
              }
            }
          }
        }
      ]).exec();
    
      for (const review of allReviews) {
        const reviewId = review._id;
        const comments = await reviewComments.aggregate([
          {
            $match: { review_id: reviewId }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'userDetails'
            }
          },
          {
            $unwind: '$userDetails'
          },
          {
            $project: {
              _id: 1,
              content: 1,
              date_commented: 1,
              commentUserName: '$userDetails.username',
              commentUserAvatar : '$userDetails.avatar',
              date_commented_formatted: {
                $function: {
                  body: formatDateISO,
                  args: ['$date_commented'],
                  lang: 'js'
                }
              }
            }
          }
        ]).exec();
    
        review.comments = comments;
      }
 
     const { username2, password2 } = req.body;

     try {

        const user = await userSchemas.users.findOne({ username: username2 });
    
        if (!user) {
            const errorMessage = 'Username does not exist, try again.';
            res.render('registerorlogin', {
                title: "TaftFinds - Register/Login",
                message: errorMessage,
                redirectUrl: `/registerorlogin/${id}`,
                links: links,
                LogInData: restoReviewsdata
            });
            return;
        }
    
        const passwordMatch = await bcrypt.compare(password2, user.password);
    
        if (!passwordMatch) {
            const errorMessage = 'Password does not match, try again.';
            res.render('registerorlogin', {
                title: "TaftFinds - Register/Login",
                message: errorMessage,
                redirectUrl: `/registerorlogin/${id}`,
                links: links,
                LogInData: restoReviewsdata
            });
            return;
        }
    
        req.session.loggedIn = true;
        req.session.userId = user._id;

        res.render('restaurant-reviews', {
            title: "TaftFinds - Register/Login",
            message: 'Logged-in Successfully!',
            links: links,
            restoReviewsdata: restoReviewsdata,
            allReviews: allReviews,
            userData: user
        });
    
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
      }
 }); 

 router.get('/logout/:id', function(req, res, next) {
  var id = new mongoose.Types.ObjectId(req.params.id);

  req.session.loggedIn = false;
  req.session.userId = null;

  let LoginData2;

  let restaurants = schemas.restaurants;

   restaurants.findOne({_id:id}).then((LoginData) => {
        LoginData2 = LoginData;
    });

  var links = [
    {linkTitle:"Home", link: "/"},
    {linkTitle:"Restaurants", link: "/restaurants"},
    {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
   ]; 

  const successMessage = 'Log-out successful!';

  res.render('registerorlogin', {
    title: "TaftFinds - Register/Login",
    message: successMessage,
    redirectUrl: `/registerorlogin/${id}`, 
    links: links,
    LoginData:  LoginData2
   });
}); 
 
 module.exports = router;
