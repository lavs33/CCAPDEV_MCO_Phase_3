const express = require('express');
const router = express.Router();
var mongoose = require('mongoose');
const mySchemas = require('../models/restaurantModel');

router.post('/results', async (req, res) => {
    const minRating = parseFloat(req.body.minRating);
    const maxRating = parseFloat(req.body.maxRating);  

    if (minRating > maxRating) {
        res.render('error', {message: 'Minimum rating cannot be greater than maximum rating',
        links: [
            {linkTitle: "Home", link: "/"},
            {linkTitle: "Restaurants", link: "/restaurants"},
            {linkTitle: "For Our Establishments", link: "/establishments-log-in"}
        ]});
    }

  try {
    const restaurants = await mySchemas.restaurants.find({
      overall_rating: { $gte: minRating, $lte: maxRating }
    }).exec();

    res.render('filter-restaurants', {
      title: "Filtered Results",
      links: [
        {linkTitle: "Home", link: "/"},
        {linkTitle: "Restaurants", link: "/restaurants"},
        {linkTitle: "For Our Establishments", link: "/establishments-log-in"}
      ],
      minimumRating: `Minimum Rating: ${minRating}`,
      maximumRating: `Maximum Rating: ${maxRating}`,
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
