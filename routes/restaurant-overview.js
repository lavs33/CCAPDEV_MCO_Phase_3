var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var restoSchemas = require('../models/restaurantModel');
var reviewSchemas = require('../models/reviewModel');
var userSchemas = require('../models/userModel');

const formatDateISO = require('../helpers/formatISODate');
const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

  router.get('/:id',  loadUserMiddleware, async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    var links = [
        {linkTitle:"Home", link: "/"},
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 

    let restaurants = restoSchemas.restaurants;


    const restaurantReviews = reviewSchemas['restaurant-reviews'];

    const restoOverviewdata = await restaurants.findOne({ _id: id });

    const topReviews =  await restaurantReviews.aggregate([
            {
            $match: {restaurant_id: id}
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
            $limit: 3
            },
            {
            $project: {
                _id: 1,
                title: 1,
                rating: 1,
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
                      lang: 'js',
                    },
                  },
              }
            }
        ]).exec();

        
        let user;

        if (req.user) {
            user = req.user;
        } 


        res.render('restaurant-overview', {links: links, title: restoOverviewdata.name + " Overview", restoOverviewdata: restoOverviewdata, topReviews: topReviews, userData: user});
});

 module.exports = router;
