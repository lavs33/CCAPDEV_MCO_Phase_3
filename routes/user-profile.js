var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var restoSchemas = require('../models/restaurantModel');
var reviewSchemas = require('../models/reviewModel');
var commentSchemas = require('../models/commentModel');
var userSchemas = require('../models/userModel');

const formatDateISO = require('../helpers/formatISODate');
const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

router.get('/:id', async(req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.params.id);

  try {
    const userData = await userSchemas.users.findOne({ _id: userId });

    if (!userData) {
      return res.status(404).send('User not found');
    }

    const restaurant_reviews = reviewSchemas['restaurant-reviews']; 

    const userReviews = await restaurant_reviews
      .find({ user_id: userId })
      .sort({ date_posted: -1 })
      .limit(5)
      .populate({
        path: 'restaurant_id',
        model:  restoSchemas.restaurants,
        select: 'name' 
      });

    userReviews.forEach(review => {
        review.date_posted_formatted = formatDateISO(review.date_posted);
     });

    const comments = await commentSchemas['reviews-comments']; 

    const userComments = await comments
      .find({ user_id: userId })
      .sort({ date_commented: -1 })
      .limit(5)
      .populate({
        path: 'review_id',
        model: reviewSchemas['restaurant-reviews'], 
        populate: {
          path: 'restaurant_id',
          model: restoSchemas.restaurants,
          select: 'name',
        },
    });

    userComments.forEach(comment => {
      comment.date_commented_formatted = formatDateISO(comment.date_commented);
    });

    for (const comment of userComments) {
      comment.restaurant_name = comment.review_id.restaurant_id.name;
    }

    var links = [
      { linkTitle: 'Home', link: '/' },
      { linkTitle: 'Restaurants', link: '/restaurants' },
      { linkTitle: 'For Our Establishments', link: '/establishments-log-in' },
    ];

    res.render('user-profile', {
      title: 'User Profile - ' + userData.username,
      links: links,
      userData: userData,
      userReviews: userReviews,
      userComments: userComments,
    });

  } catch (err) {
      console.error('Error fetching user data:', err);
      res.status(500).send('Internal Server Error');
  }
});

router.get('/allposts/:id', loadUserMiddleware, async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.params.id);

  try {

    const userData = req.user;

    const userProfileData = await userSchemas.users.findOne({ _id: userId });

    if (!userProfileData) {
      return res.status(404).send('User not found');
    }

    const isOwnProfile = new mongoose.Types.ObjectId(userData._id).equals(userId);

    const restaurant_reviews = reviewSchemas['restaurant-reviews']; 

    const userReviews = await restaurant_reviews
      .find({ user_id: userId })
      .sort({ date_posted: -1 })
      .populate({
        path: 'restaurant_id',
        model: restoSchemas.restaurants,
        select: 'name',
      });

    userReviews.forEach(review => {
      review.date_posted_formatted = formatDateISO(review.date_posted);
    });

    const comments = await commentSchemas['reviews-comments']; 

    const userComments = await comments
      .find({ user_id: userId })
      .sort({ date_commented: -1 })
      .populate({
        path: 'review_id',
        model: reviewSchemas['restaurant-reviews'], 
        populate: {
          path: 'restaurant_id',
          model: restoSchemas.restaurants,
          select: 'name',
        },
      });

    userComments.forEach(comment => {
      comment.date_commented_formatted = formatDateISO(comment.date_commented);
      comment.restaurant_name = comment.review_id.restaurant_id.name;
    });

    var links = [
      { linkTitle: 'Home', link: '/' },
      { linkTitle: 'Restaurants', link: '/restaurants' },
      { linkTitle: 'For Our Establishments', link: '/establishments-log-in' },
    ];

    res.render('user-all-reviews-and-comments', {
      title: 'All Posts of ' + userProfileData.username,
      links: links,
      userProfileData: userProfileData,
      isOwnProfile: isOwnProfile,
      userReviews: userReviews,
      userComments: userComments,
    });

  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/edited/:id', async function (req, res, next) {

      var links = [
        {linkTitle:"Home", link: "/"},
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 

    const userId = req.params.id;
    const profile_description = req.body['profile-description'];
    const profile_picture = req.body['profile-picture'];

    try {
      const updatedFields = {};
  
      if (profile_description !== undefined) {
        updatedFields.description = profile_description;
      }
  
      if (profile_picture) {
        updatedFields.avatar = profile_picture;
      }
  
      await userSchemas.users.updateOne({ _id: userId }, { $set: updatedFields });
  
      const updatedUser = await userSchemas.users.findById(userId);
  
      res.render('user-profile', {
        title: "User Profile - " + updatedUser.username,
        links: links,
        userData: updatedUser
     });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).render('error'); 
    }
});

 
 module.exports = router;