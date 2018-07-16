const rp = require('request-promise');
const Season = require('../models/season');

function playerSeason(req, res, next){
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
          res.json(season);
        });
    })
    .catch(next);
}

function playerMatches(req, res, next){
  rp({
    method: 'GET',
    url: `https://api.playbattlegrounds.com/shards/pc-eu/matches/${req.params.matchId}`,
    headers: {
      Accept: 'application/vnd.api+json'
    },
    json: true
  })
    .then(match => res.json(match))
    .catch(next);
}

function matchInfo(req, res, next){
  console.log('hi!');
  rp({
    method: 'GET',
    url: 'https://telemetry-cdn.playbattlegrounds.com/bluehole-pubg/pc-eu/2018/07/16/15/12/96c7af11-890a-11e8-b291-0a586461b35b-telemetry.json',
    headers: {
      Accept: 'application/vnd.api+json'
    },
    json: true
  })
    .then(matchInfo => console.log(matchInfo), res.json(matchInfo))
    .catch(next);
}

module.exports = {
  season: playerSeason,
  matches: playerMatches,
  match: matchInfo
};
