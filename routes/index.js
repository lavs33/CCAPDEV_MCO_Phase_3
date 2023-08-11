var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    
    var links = [
        {linkTitle:"Restaurants", link: "/restaurants"},
        {linkTitle:"For Our Establishments", link: "/establishments-log-in"}
    ]; 

    res.render('index', {
        title: "Home - About DLSU Food",
        links: links
    });
});


module.exports = router;