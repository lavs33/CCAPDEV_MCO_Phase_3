var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var restoSchemas = require('../models/restaurantModel');
var reviewSchemas = require('../models/reviewModel');
var commentSchemas = require('../models/commentModel');
var userSchemas = require('../models/userModel');

const formatDateISO = require('../helpers/formatISODate');
const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

  router.get('/:id', loadUserMiddleware, async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    var links = [
        {linkTitle:"Home", link: "/"},
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 

    let restaurants = restoSchemas.restaurants;


    const restaurantReviews = reviewSchemas['restaurant-reviews'];
    const reviewComments = commentSchemas['reviews-comments'];

    const restoReviewsdata = await restaurants.findOne({ _id: id });

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
               commentUserId: '$userDetails._id',
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

      let user;

      if (req.user) {
          user = req.user;
      } 
    

        res.render('restaurant-reviews', {links: links, title: restoReviewsdata.name + " Reviews", restoReviewsdata: restoReviewsdata, allReviews: allReviews,   userData: user});
});
 
router.get('/:id/scroll-to-review/:reviewId',  loadUserMiddleware, async function(req, res, next) {
  
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

    const restoReviewsdata = await restaurants.findOne({ _id: id });

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
              commentUserId: '$userDetails._id',
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

      let user;

      if (req.user) {
          user = req.user;
      } 

  res.render('restaurant-reviews', {
    links: links,
    title: restoReviewsdata.name + " Reviews",
    restoReviewsdata: restoReviewsdata,
    userData: user,
    allReviews: allReviews,
    reviewId: reviewId2 
  }); 
});


router.post('/create-review/:id',  loadUserMiddleware, async function(req, res, next) {

  var links = [
    {linkTitle:"Home", link: "/"},
    {linkTitle:"Restaurants", link: "/restaurants"},
    {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
  ]; 

  const restaurantId = req.params.id;
  const {reviewTitle, reviewKeyword1, reviewKeyword2, reviewKeyword3, reviewBody, ratingStars, posOrNeg, reviewImage1, reviewImage2, reviewImage3, reviewImage4, reviewImage5, reviewVideo1, reviewVideo2, reviewVideo3} = req.body;

  try {
    
    const Restaurant = restoSchemas.restaurants;
    const restoReviewsdata= await Restaurant.findOne({ _id: restaurantId });

    const restaurantReviews = reviewSchemas['restaurant-reviews'];
    const reviewComments = commentSchemas['reviews-comments'];


    const userData = req.user;

    const reviewImages = [];
    const reviewVideos = [];

    if (reviewImage1) reviewImages.push('reviews-images/' + reviewImage1);
    if (reviewImage2) reviewImages.push('reviews-images/' + reviewImage2);
    if (reviewImage3) reviewImages.push('reviews-images/' + reviewImage3);
    if (reviewImage4) reviewImages.push('reviews-images/' + reviewImage4);
    if (reviewImage5) reviewImages.push('reviews-images/' + reviewImage5);

    if (reviewVideo1) reviewVideos.push('reviews-videos/' + video1);
    if (reviewVideo2) reviewVideos.push('reviews-videos/' + video2);
    if (reviewVideo3) reviewVideos.push('reviews-videos/' + video3);

    const review = new restaurantReviews({
      _id: new mongoose.Types.ObjectId(),
      title: reviewTitle,
      body: reviewBody,
      rating: parseInt(ratingStars),
      positive: posOrNeg === 'Positive', 
      date_posted: new Date(),
      helpful_no: 0,
      unhelpful_no: 0,
      comments_no: 0,
      user_id: userData._id,
      restaurant_id: restaurantId,
      comments: [],
      review_keywords: [reviewKeyword1, reviewKeyword2, reviewKeyword3],
      review_images: reviewImages,
      review_videos: reviewVideos
    });


    await review.save();

    
    const allReviews = await restaurantReviews.aggregate([
      {
        $match: { restaurant_id: restaurantId }
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
            commentUserId: '$userDetails._id',
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


    const successMessage = 'Review was successfully created.';
    res.render('restaurant-reviews', {
      title:  restoReviewsdata.name + " Reviews",
      restoReviewsdata: restoReviewsdata,
      userData: userData, 
      allReviews: allReviews,
      successMessage: successMessage,
      redirectUrl: `/restaurant-reviews/${restaurantId}`,
      links: links
    });

     return;
  } catch (error) {
    console.error(error);
    const errorMessage = 'An error occurred while creating the review.';
    res.render('restaurant-reviews', {
      title:  restoReviewsdata.name + " Reviews",
      restoReviewsdata: restoReviewsdata,
      userData: userData, 
      allReviews: allReviews,
      errorMessage: errorMessage,
      redirectUrl: `/restaurant-reviews/${restaurantId}`,
      links: links
    });
  }
});

router.get('/:id/mark-helpful/scroll-to-review/:reviewId', loadUserMiddleware, async (req, res) => {
      const reviewId2 = new mongoose.Types.ObjectId(req.params.reviewId); 

      var id = new mongoose.Types.ObjectId(req.params.id);

      const userData = req.user;

      var links = [
            {linkTitle:"Home", link: "/"},
            {linkTitle:"Restaurants", link: "/restaurants"},
            {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
      ]; 

      let restaurants = restoSchemas.restaurants;

      const restaurantReviews = reviewSchemas['restaurant-reviews'];

      const review = await restaurantReviews.findById(reviewId2);

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      review.helpful_no += 1;
      await review.save();

      const reviewComments = commentSchemas['reviews-comments'];

      const restoReviewsdata = await restaurants.findOne({ _id: id });

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
                commentUserId: '$userDetails._id',
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

        res.render('restaurant-reviews', {
          links: links,
          title: restoReviewsdata.name + " Reviews",
          restoReviewsdata: restoReviewsdata,
          userData: userData,
          allReviews: allReviews,
          reviewId: reviewId2 
        }); 
});


router.get('/:id/mark-unhelpful/scroll-to-review/:reviewId', loadUserMiddleware, async (req, res) => {
  const reviewId2 = new mongoose.Types.ObjectId(req.params.reviewId); 

  var id = new mongoose.Types.ObjectId(req.params.id);

  const userData = req.user;

  var links = [
        {linkTitle:"Home", link: "/"},
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
  ]; 

  let restaurants = restoSchemas.restaurants;

  const restaurantReviews = reviewSchemas['restaurant-reviews'];

  const review = await restaurantReviews.findById(reviewId2);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.unhelpful_no += 1;
  await review.save();

  const reviewComments = commentSchemas['reviews-comments'];

  const restoReviewsdata = await restaurants.findOne({ _id: id });

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
            commentUserId: '$userDetails._id',
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

    res.render('restaurant-reviews', {
      links: links,
      title: restoReviewsdata.name + " Reviews",
      restoReviewsdata: restoReviewsdata,
      userData: userData,
      allReviews: allReviews,
      reviewId: reviewId2 
    }); 
});

module.exports = router;


