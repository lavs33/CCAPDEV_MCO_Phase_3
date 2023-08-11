var mongoose = require('mongoose');
var schema = mongoose.Schema;

const commentSchema = new schema({
    _id: mongoose.ObjectId,
    content: String,
    date_commented: Date,
    review_id: mongoose.ObjectId,
    user_id: mongoose.ObjectId,
});

const reviews_comments = mongoose.model('reviews-comments', commentSchema, 'reviews-comments');
let mySchemas = {'reviews-comments':reviews_comments};

module.exports = mySchemas;
