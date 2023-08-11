var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var restoSchemas = require('../models/restaurantModel');
var userSchemas = require('../models/userModel');

const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

router.get('/:id', loadUserMiddleware, async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    let restaurants = restoSchemas.restaurants;

    let user;

    if (req.user) {
        user = req.user;
    } 

    restaurants.findOne({_id:id}).then((restaurantPhotosData) => {
         var links = [
             {linkTitle:"Home", link: "/"},
             {linkTitle:"Restaurants", link: "/restaurants"},
             {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
         ]; 
     
         restoPhotosdata = restaurantPhotosData;

         res.render('restaurant-photos', {
             title: restoPhotosdata.name + " Photos",
             links: links,
             userData: user,
             restoPhotosdata: restoPhotosdata
         });
 })
}); 

  
 module.exports = router;
