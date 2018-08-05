const mongoose = require('mongoose');

const matchInfoSchema = new mongoose.Schema({
  attributes: {
    ping: { type: String },
    teams: { type: Number }
  },
  player1: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    coords: {}
  },
  player2: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    coords: {}
  },
  player3: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    coords: {}
  },
  player4: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    coords: {}
  }
});

matchInfoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MatchInfo', matchInfoSchema);
