var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var schemas = require('../models/restaurantModel');

const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

router.get('/:id', loadUserMiddleware, async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    let restaurants = schemas.restaurants;

    let user;

    if (req.user) {
        user = req.user;
    } 

    restaurants.findOne({_id:id}).then((restaurantFrontData) => {
         var links = [
             {linkTitle:"Home", link: "/"},
             {linkTitle:"Restaurants", link: "/restaurants"},
             {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
         ]; 
     
         restoFrontdata = restaurantFrontData;

         res.render('restaurant-front', {
             title: restoFrontdata.name,
             links: links,
             userData: user,
             restoFrontdata: restoFrontdata
         });
 })
}); 

 
 module.exports = router;
