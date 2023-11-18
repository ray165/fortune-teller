const express = require('express')
const router = express.Router()
const { verifyAccessToken } = require('../utils/tokens')


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
    res.send('Hello 👋, this is stats endpoint');
});

router.get('/update', async (req, res) => {
    res.send('something');
});

router.delete('/reset', async (req, res) => {
    // delete all records in side of the api stats table of mongodb

    // then run the update endpoint. Which will return nothing. frontend should get  [] and parse nothing. 
})

module.exports = router;