
const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
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

const Stats = mongoose.model('Stats', statsSchema);

module.exports = Stats;
