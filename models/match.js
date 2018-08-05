const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  attributes: {
    id: { type: String },
    telemetryURL: { type: String },
    createdAt: { type: Date },
    date: { type: String },
    duration: { type: Number },
    gameMode: { type: String },
    mapName: { type: String },
    shardId: { type: String }
  },
  player1: {},
  player2: {},
  player3: {},
  player4: {},
  info: {
    type: mongoose.Schema.ObjectId, ref: 'MatchInfo'
  }
});

matchSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Match', matchSchema);
