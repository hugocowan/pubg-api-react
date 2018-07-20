const Season = require('../models/season');

function indexRoute(req, res, next) {
  Season
    .find()
    .byName(req.params.username)
    .then(season => {
      if(!season[0]) throw 'Too many requests.';
      res.json(season[0]);
    })
    .catch(next);

}

module.exports = {
  index: indexRoute
};
