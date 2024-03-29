const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verifyAccessToken, isUserAuthenticated, retrieveToken } = require('../utils/tokens')
const Stats = require('../models/stats');
// const User = require('../models/user');
const UserStats = require('../models/userStats');
const MongoUser = require('../models/user');
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

// Use this endpoint to get usage stats for EACH user
router.get('/eachUser', async (req, res) => {
    const token = retrieveToken(req);
    console.log("each user endpoint called");
    const { username, password} = req.body;
    const { message, user } = await getUser(username, password, token);

    if (!user) {
        return res.status(401).json({ message });
    }

    UserStats.find({}).then(stats => {
        // console.log(stats);
        console.log("stats: ", stats);
        res.json(stats);
    }).catch(err => {
        console.error(err);
        res.json([]);
    });
});


// DELETE request to delete all records from the Stats collection
router.delete('/delete-stats', async (req, res) => {
    try {
      // Delete all records from the Stats collection
      await Stats.deleteMany({});
      res.status(200).json({ message: 'All records deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
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

router.delete('/reset', async (req, res) => {
    // delete all records in side of the api stats table of mongodb
    console.log("reset endpoint called");
    const token = retrieveToken(req);
    const { username, password} = req.body;
    const { message, user } = await getUser(username, password, token);

    if (!user) {
        return res.status(401).json({ message });
    }

    // then run the update endpoint. Which will return nothing. frontend should get  [] and parse nothing. 
    try {
        // Delete all records from the Stats collection
        await Stats.deleteMany({});
        await UserStats.deleteMany({});
        res.status(200).json({ message: 'All request counts reset to 0' });
    }
    catch (err) {
        res.status(500).json({ error: `Internal Server Error ${err}` });
    }
    
})

module.exports = router;