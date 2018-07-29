const mongoose = require('mongoose');

const playerSeasonSchema = new mongoose.Schema({
  solo: {},
  'solo-fpp': {},
  duo: {},
  'duo-fpp': {},
  squad: {},
  'squad-fpp': {}
});

// playerSeason.query.byName = function(name) {
//   return this.where({ name });
// };

playerSeasonSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('PlayerSeason', playerSeasonSchema);
