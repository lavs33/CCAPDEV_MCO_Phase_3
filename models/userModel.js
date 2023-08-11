var mongoose = require('mongoose');
var schema = mongoose.Schema;

const userSchema = new schema({
    _id: mongoose.ObjectId,
    username: String,
    password: String,
    no_of_reviews: Number,
    avatar: String,
    description: String
});

const users = mongoose.model('users', userSchema, 'users');
let mySchemas = {'users':users};

module.exports = mySchemas;