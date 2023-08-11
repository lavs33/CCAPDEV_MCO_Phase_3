var express = require('express');
var router = express.Router();
var schemas = require('../models/restaurantModel');

router.get('/', function(req, res, next) {
   
   let restaurants = schemas.restaurants;

   restaurants.find().then((restaurantsData) => {
            var links = [
                {linkTitle:"Home", link: "/"},
                {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
            ]; 
        
            restodata = restaurantsData;
            res.render('restaurants', {
                title: "Restaurants in DLSU",
                links: links,
                restodata: restaurantsData
            });
    })
});

module.exports = router;