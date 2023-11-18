const Stats = require('../models/stats');

const endpointWhitelist = [ // Whitelist of endpoints that we want to track
    '/auth/signup',
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/stats/all',
    '/stats/update',
    '/stats/reset',
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

module.exports = {
    logUsage
}