const Season = require('../models/season');

function indexRoute(req, res, next) {
  Season
    .find()
    .byName(req.params.username)
    .exec()
    .then(season => {
      console.log(season);
      res.json(season[0]);
    })
    .catch(next);

}

module.exports = {
  index: indexRoute
};
