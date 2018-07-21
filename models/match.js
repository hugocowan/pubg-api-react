const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({

},{
  strict: false
});

module.exports = mongoose.model('Match', matchSchema);
