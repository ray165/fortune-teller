const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', function(req, res){
    console.log("GET request received for the root route.");
    // console.log("request", req);
    // console.log("response", res);

    let landingPagePath = path.join(__dirname, '../', 'src', 'landing.html');
    res.sendFile(landingPagePath);
});

module.exports = router;