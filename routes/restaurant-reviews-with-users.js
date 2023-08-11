var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var restoSchemas = require('../models/restaurantModel');
var reviewSchemas = require('../models/reviewModel');
var commentSchemas = require('../models/commentModel');
var userSchemas = require('../models/userModel');

var bcrypt = require('bcrypt');

const formatDateISO = require('../helpers/formatISODate');

router.post('/:id', async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    let restaurants = restoSchemas.restaurants;

    const restaurantReviews = reviewSchemas['restaurant-reviews'];
    const reviewComments = commentSchemas['reviews-comments'];
    const users = userSchemas['users'];

    var links = [
        {linkTitle:"Home", link: "/"},
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 

    const { username, password, description, image } = req.body;

    const restoData = await restaurants.findOne({ _id: id });

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

      const newUser = new userSchemas.users({
        _id: new mongoose.Types.ObjectId(),
        username: username,
        password: password,
        description: description,
        avatar: "avatars/" + image,
        no_of_reviews: 0
      });
    
      await newUser.save();
    
      res.render('restaurant-reviews-with-users', {
        links: links,
        title: restoData.name + " Reviews",
        restoData: restoData,
        allReviews: allReviews,
        userData: newUser,
      });
    });
  
module.exports = router;

router.get('/:id/users/:userId', async function(req, res, next) {

  var id = new mongoose.Types.ObjectId(req.params.id);

  var links = [
      {linkTitle:"Home", link: "/"},
      {linkTitle:"Restaurants", link: "/restaurants"},
      {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
  ]; 

  let restaurants = restoSchemas.restaurants;


  const restaurantReviews = reviewSchemas['restaurant-reviews'];
  const reviewComments = commentSchemas['reviews-comments'];

  const restoData = await restaurants.findOne({ _id: id });

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

     const user = await userSchemas.users.findOne({ _id: req.params.userId });

     res.render('restaurant-reviews-with-users', {links: links, title: restoData.name + " Reviews", restoData: restoData, allReviews: allReviews, userData: user});
});

router.get('/:id/scroll-to-review/:reviewId/:userId', async function(req, res, next) {

const reviewId2 = new mongoose.Types.ObjectId(req.params.reviewId); 

var id = new mongoose.Types.ObjectId(req.params.id);

  var links = [
      {linkTitle:"Home", link: "/"},
      {linkTitle:"Restaurants", link: "/restaurants"},
      {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
  ]; 

  let restaurants = restoSchemas.restaurants;


  const restaurantReviews = reviewSchemas['restaurant-reviews'];
  const reviewComments = commentSchemas['reviews-comments'];

  const restoData = await restaurants.findOne({ _id: id });

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
          restaurant_id: 1,
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

    const user = await userSchemas.users.findOne({ _id: req.params.userId });

    res.render('restaurant-reviews-with-users', {
      links: links,
      title: restoData.name + " Reviews",
      restoData: restoData,
      allReviews: allReviews,
      reviewId: reviewId2,
      userData: user
    }); 
});