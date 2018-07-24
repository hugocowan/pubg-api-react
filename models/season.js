const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: { type: String },
  attributes: {
    createdAt: { type: String },
    shardId: { type: String }
  },
  matches: [{}]
});

seasonSchema.query.byName = function(name) {
  return this.where({ name });
};

seasonSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Season', seasonSchema);
