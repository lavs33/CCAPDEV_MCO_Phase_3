var mongoose = require('mongoose');
var schema = mongoose.Schema;

const restaurantSchema = new schema({
    _id: mongoose.ObjectId,
    name: String,
    keywords: [String],
    address: String,
    badges: [String],
    main_img: String,
    address_img: String,
    badges_description: [String], 
    badges_img: [String],
    contact_number: String,
    cover_photos: [String],
    known_for: String,
    location_hall: String,
    menu_images: [String],
    more_info: [String],  
    no_of_reviews: Number,
    opening_hours: String,
    overall_rating: Number,
});

const restaurants = mongoose.model('restaurants', restaurantSchema, 'restaurants');
let mySchemas = {'restaurants':restaurants};

module.exports = mySchemas;

