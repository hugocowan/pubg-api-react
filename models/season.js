const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String },
  date: { type: String },
  attributes: {
    createdAt: { type: String },
    shardId: { type: String }
  },
  matches: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Match'
  }]
});

seasonSchema.query.byName = function(name) {
  return this.where({ name });
};

seasonSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Season', seasonSchema);
