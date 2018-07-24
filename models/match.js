const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  info: {
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
    username: {}
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

matchSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Match', matchSchema);
