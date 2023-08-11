const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const reviewSchemas = require('../models/reviewModel');
const restaurantSchemas = require('../models/restaurantModel');
const commentSchemas = require('../models/commentModel');
const userSchemas = require('../models/userModel');

const formatDateISO = require('../helpers/formatISODate');
const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

router.post('/:id', loadUserMiddleware, async function (req, res, next) {
    const id = new mongoose.Types.ObjectId(req.params.id);
    const searchQuery = req.body.searchQuery;

     var links = [
        {linkTitle:"Home", link: "/"},
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 

    const restaurants = restaurantSchemas.restaurants;
    const restaurantData = await restaurants.findOne({ _id: id });

    const restaurantReviews = reviewSchemas['restaurant-reviews'];

    const reviews = await restaurantReviews.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: searchQuery, $options: 'i' } },
            { body: { $regex: searchQuery, $options: 'i' } },
          ],
          restaurant_id: id,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          _id: 1,
          title: 1,
          body: 1,
          rating: 1,
          review_keywords: 1,
          review_images: 1,
          review_videos: 1,
          helpful_no: 1,
          unhelpful_no: 1,
          comments_no: 1,
          positive: 1,
          reviewId: '$_id',
          userName: '$userDetails.username',
          userAvatar: '$userDetails.avatar',
          date_posted_formatted: {
            $function: {
              body: formatDateISO,
              args: ['$date_posted'],
              lang: 'js',
            },
          },
        },
      },
    ]);

    for (const review of reviews) {
      const comments = await commentSchemas['reviews-comments'].find({ review_id: review._id });

      for (const comment of comments) {
        const user = await userSchemas.users.findById(comment.user_id);
        comment.commentUserName = user.username;
        comment.commentUserAvatar = user.avatar;
        comment.date_commented_formatted = formatDateISO(comment.date_commented);
      }

      review.comments = comments;
    }

    let user;

    if (req.user) {
      user = req.user;
    } 

    res.render('search-reviews-results', {
      restaurantData: restaurantData,
      searchQuery: searchQuery,
      searchReviewsResults: reviews,
      links: links,
      userData: user,
      title: "Search " + restaurantData.name + " Reviews"
    });
})

module.exports = router;