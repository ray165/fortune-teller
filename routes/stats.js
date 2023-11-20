const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verifyAccessToken, isUserAuthenticated, retrieveToken } = require('../utils/tokens')
const Stats = require('../models/stats');
const User = require('../models/user');
const { getUser } = require('../utils/user');


/**
 *  Steps:
 *      0. Validate JWT if they have authorization before running the update request
 *          - can use verifyAccessToken import function. If JWT token is valid, returns (True, user_id), else False
 *      
 *      1. create a model to query the usage stats in mongodb
 *      2. Pull all data then filter it. Have two version of data sent back to client
 *      3. Json data fields:
 *              aggregate 
 *              breakdown
 *      
 * 
 */

router.get('/', async (req, res) => {
    isUserAuthenticated(req, res);
    res.send('Hello 👋, this is stats endpoint');
});

// Use this endpoint to get usage stats for all users
router.get('/allUsers', async (req, res) => {
    // isUserAuthenticated(req, res);
    const token = retrieveToken(req);
    console.log("allUsers endpoint called");
    const { username, password} = req.body;
    const { message, user } = await getUser(username, password, token);

    if (!user) {
        return res.status(401).json({ message });
    }

    Stats.find({}).then(stats => {
        // console.log(stats);
        console.log("stats: ", stats);
        res.json(stats);
    }).catch(err => {
        console.error(err);
        res.json([]);
    });
});

// Routes for user login: allow multiple John as username, match password with all Johns
router.post('/myUser', async (req, res) => {
    isUserAuthenticated(req, res);

    try {
        const { username, password, token } = req.body;
        const { message, user } = await getUser(username, password, token);

        if (!user) {
            return res.status(401).json({ message });
        }

        // console.log(users[0].stats);
        res.json(user.stats);

    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ 
            message: "Error signing in!", 
            type: "error",
            err,
        });
    }
});


router.get('/update', async (req, res) => {
    res.send('something');
});

router.delete('/reset', async (req, res) => {
    // delete all records in side of the api stats table of mongodb

    // then run the update endpoint. Which will return nothing. frontend should get  [] and parse nothing. 
})

module.exports = router;