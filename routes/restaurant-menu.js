var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var restoSchemas = require('../models/restaurantModel');
var userSchemas = require('../models/userModel');

const loadUserMiddleware = require('../helpers/loadUserMiddleware'); 

router.get('/:id',  loadUserMiddleware, async function(req, res, next) {

    var id = new mongoose.Types.ObjectId(req.params.id);

    let restaurants = restoSchemas.restaurants;

    
    let user;

    if (req.user) {
        user = req.user;
    } 

    restaurants.findOne({_id:id}).then((restaurantMenuData) => {
         var links = [
             {linkTitle:"Home", link: "/"},
             {linkTitle:"Restaurants", link: "/restaurants"},
             {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
         ]; 
     
         restoMenudata = restaurantMenuData;

         res.render('restaurant-menu', {
             title: restoMenudata.name + " Menu",
             links: links,
             userData: user,
             restoMenudata: restoMenudata
         });
 })
});

module.exports = router;
