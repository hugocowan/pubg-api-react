const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const { dbURI } = require('../config/environment');

mongoose.connect(dbURI, (err, db) => {
  // console.log(db);
  db.dropDatabase();
  mongoose.connection.close();
});
