const mongoose = require('mongoose');

const matchInfoSchema = new mongoose.Schema({
  attributes: {
    matchId: { type: String },
    ping: { type: String },
    date: { type: Date },
    teams: { type: Number }
  },
  player1: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    data: {},
    coords: {},
    username: {},
    mapData: {}
  },
  player2: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    data: {},
    coords: {},
    username: {}
  },
  player3: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    data: {},
    coords: {},
    username: {}
  },
  player4: {
    avgFPS: {},
    time: {},
    kills: {},
    death: {},
    data: {},
    coords: {},
    username: {}
  }
});

matchInfoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('MatchInfo', matchInfoSchema);
