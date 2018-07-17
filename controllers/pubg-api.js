const rp = require('request-promise');
const Season = require('../models/season');
const config = require('../config');

function playerSeason(req, res, next){
  console.log('Getting season...');
  const tempMatch = [];

  function sendData(){
    // console.log('tempMatch: ',tempMatch);
    res.json(tempMatch);
  }

  return rp({
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
      return Season
        .create(season.data[0])
        .then(season => {
          const matchIds = season.relationships.matches.data;

          matchIds.forEach(match => {
            rp({
              method: 'GET',
              url: `https://api.playbattlegrounds.com/shards/pc-eu/matches/${match.id}`,
              headers: {
                Accept: 'application/vnd.api+json'
              },
              json: true
            })
              .then(res => {
                const id = res.data.relationships.assets.data[0].id;
                let telemetryURL;
                res.included.forEach((asset) => {
                  if(asset.id === id){
                    telemetryURL = asset.attributes.URL;
                    tempMatch.push({
                      id,
                      telemetryURL,
                      attributes: res.data.attributes
                    });
                  }
                });
                if(tempMatch.length === matchIds.length){
                  sendData();
                }
              });
          });
        });
    })
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
  match: matchInfo
};
