const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  attributes: {
    createdAt: { type: String },
    name: { type: String },
    shardId: { type: String }
  },
  relationships: {
    matches: {
      data: [{}]
    }
  }
});

module.exports = mongoose.model('Season', seasonSchema);
