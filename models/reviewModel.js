var mongoose = require('mongoose');
var schema = mongoose.Schema;

const reviewSchema = new schema({
    _id: mongoose.ObjectId,
    title: String,
    body: String,
    date_posted: { type: Date, default: Date.now },
    positive: Boolean,
    review_keywords: [String],
    rating: Number,
    helpful_no: Number, 
    unhelpful_no: Number,
    comments_no: Number,
    restaurant_id: mongoose.ObjectId,
    user_id: mongoose.ObjectId,
    review_images: [String],
    review_videos: [String],
    comments: [mongoose.ObjectId]
});

reviewSchema.index({ body: 'text' });

const restaurant_reviews = mongoose.model('restaurant-reviews', reviewSchema, 'restaurant-reviews');
let mySchemas = {'restaurant-reviews':restaurant_reviews};

module.exports = mySchemas;
