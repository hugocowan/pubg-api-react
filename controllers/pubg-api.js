const rp = require('request-promise');
const Season = require('../models/season');

function PlayerMatches(req, res, next){
  console.log('Getting season...', process.env.PUBG_API_KEY);
  rp({
    method: 'GET',
    url: `https://api.playbattlegrounds.com/shards/pc-eu/players?filter[playerNames]=${req.params.username}`,
    headers: {
      Authorization: `Bearer ${config.PUBG_API_KEY}`,
      Accept: 'application/vnd.api+json'
    },
    json: true
  })
    .then(season => {
      console.log('season received.');
      Season
        .create(season.data[0])
        .then(season => {
          console.log('season: ', season);
          const matchData = season.relationships.matches.data;
          const matches = {};
          matchData.forEach((match, index) => {
            const matchNumber = `${index+1}`;
            rp({
              method: 'GET',
              url: `https://api.playbattlegrounds.com/shards/pc-eu/matches/${match.id}`,
              headers: {
                Accept: 'application/vnd.api+json'
              },
              json: true
            })
              .then(res => {
                console.log('res.data: ', res.data);
                const id = res.data.relationships.assets.data[0].id;
                let telemetryURL;
                res.data.included.forEach((asset) => {
                  if(asset.id === id)
                    telemetryURL = asset.attributes.URL;
                });

                matches[matchNumber] = {
                  id,
                  telemetryURL,
                  attributes: res.data.attributes
                };
              });
          })
            .then(() => {
              const matchesArray = Object.keys(matches).map(key => {
                return matches[key];
              });
              console.log('final array to be sent: ', matchesArray);
              res.json(matchesArray);
            });
        });
      res.json(season.data[0]);
    })
    .catch(next);
}

module.exports = {
  matches: PlayerMatches
};
