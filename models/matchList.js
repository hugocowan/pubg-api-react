const mongoose = require('mongoose');

const matchListSchema = new mongoose.Schema({
  name: { type: String },
  id: { type: String },
  date: { type: String },
  attributes: {
    createdAt: { type: String },
    shardId: { type: String }
  },
  matches: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Match'
  }],
  playerSeason: {
    type: mongoose.Schema.ObjectId,
    ref: 'PlayerSeason'
  }
});

matchListSchema.query.byName = function(name) {
  return this.where({ name });
};

matchListSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MatchList', matchListSchema);
