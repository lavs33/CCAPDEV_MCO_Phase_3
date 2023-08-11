const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const mySchemas = require('../models/restaurantModel');

router.post('/results', async (req, res)  => {
  const searchTerm = req.body.searchTerm;

  var links = [
    {linkTitle:"Home", link: "/"},
    {linkTitle:"Restaurants", link: "/restaurants"},
    {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
  ]; 


  try {
    const regex = new RegExp(searchTerm, 'i');
    const restaurants =  await mySchemas.restaurants.find({
      $or: [
        { name: { $regex: regex } },
        { keywords: { $in: [regex] } }
      ]
    }).exec();

    console.log(restaurants);

    res.render('search-food', {
      title: "Search Results",
      links: links,
      searchTerm: searchTerm,
      isFound: restaurants.length > 0,
      restoResultData: restaurants
    });
  } catch (err) {
    console.error('Error fetching restaurants data:', err);
    res.render('error', {message: 'Internal Server Error',
        links: [
            {linkTitle: "Home", link: "/"},
            {linkTitle: "Restaurants", link: "/restaurants"},
            {linkTitle: "For Our Establishments", link: "/establishments-log-in"}
   ]});
  }
});

module.exports = router;
