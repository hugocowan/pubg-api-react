const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  id: { type: String },
  telemetryURL: { type: String },
  createdAt: { type: Date },
  duration: { type: Number },
  gameMode: { type: String },
  mapName: { type: String },
  shardId: { type: String },
  info: {
    type: mongoose.Schema.ObjectId,
    ref: 'MatchInfo'
  }
});

matchSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Match', matchSchema);
