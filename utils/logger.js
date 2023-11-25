const Stats = require('../models/stats');
const UserStats = require('../models/userStats');
const { retrieveToken } = require('./tokens');
const { getUser } = require('./user');


const endpointWhitelist = [ // Whitelist of endpoints that we want to track
    '/auth/signup',
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/stats/all',
    '/stats/update',
    '/stats/reset',
    '/stats/myUser',
    '/stats/allUsers',
    '/stats/eachUser',
];

function logUsage(req, res, next) {
    console.log('Logging usage')
    const { method, originalUrl: endpoint } = req;
    if (!endpointWhitelist.includes(endpoint)) { // Filter out endpoints that we don't want to track
        return next();
    }
    console.log('method: ', method);
    console.log('endpoint: ', endpoint);
    Stats.findOne({ endpoint, method }).then(stat => {
        if (stat) {
            stat.requestCount += 1;
        } else {
            stat = new Stats({ endpoint, method, requestCount: 1 });
        }
  
        stat.save().then(() => {
            next();
        }).catch(err => {
            console.error(err);
            next();
        });
    }).catch(err => {
        console.error(err);
        next();
    });
}

async function logUserUsage(req, res, next) {
    console.log('Logging user usage')
    const { method, originalUrl: endpoint } = req;
    const token = retrieveToken(req);
    const { username, password} = req.body;
    const { message, user } = await getUser(username, password, token);
    
    if (!endpointWhitelist.includes(endpoint)) { // Filter out endpoints that we don't want to track
        return next();
    }

    console.log('method: ', method);
    console.log('endpoint: ', endpoint);
    console.log('user: ', user);

    let usernameLog = user.username;
    if (!usernameLog) {
        console.log("user is null")
        return res.status(401).json({ message });
    }
    UserStats.findOne({ usernameLog, endpoint, method }).then(stat => {
        if (stat) {
            stat.requestCount += 1;
        } else {
            stat = new UserStats({ usernameLog, endpoint, method, requestCount: 1 });
        }
  
        stat.save().then(() => {
            next();
        }).catch(err => {
            console.error(err);
            next();
        });
    }).catch(err => {
        console.error(err);
        next();
    });
}

module.exports = {
    logUsage,
    logUserUsage,
}