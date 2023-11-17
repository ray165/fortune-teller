const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
    console.log("GET request received for the root route.");
    console.log("request", req);
    console.log("response", res);
    res.sendFile(__dirname + '/src/landing.html');
});

module.exports = router;