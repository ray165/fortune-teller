const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  requestCount: {
    type: Number,
    default: 0,
  },
});

const UserStats = mongoose.model('UserStats', userStatsSchema);

module.exports = UserStats;
