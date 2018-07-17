const rp = require('request-promise');
const Season = require('../models/season');

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
      Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
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
                const id = res.data.id;
                const attrs = res.data.attributes;
                // console.log(res.data.attributes.createdAt);
                const telemetryId = res.data.relationships.assets.data[0].id;
                const maps = {
                  Erangel_Main: 'Erangel',
                  Desert_Main: 'Miramar',
                  Savage_Main: 'Sanhok'
                };
                let telemetryURL;
                res.included.forEach((asset) => {
                  if(asset.id === telemetryId){
                    telemetryURL = asset.attributes.URL;
                    tempMatch.push({
                      id,
                      telemetryURL,
                      createdAt: attrs.createdAt,
                      duration: attrs.duration,
                      gameMode: attrs.gameMode,
                      // isCustomMatch: attrs.isCustomMatch,
                      mapName: maps[attrs.mapName],
                      // stats: attrs.stats,
                      // tags: attrs.tags,
                      // titleId: attrs.titleId,
                      shardId: attrs.shardId
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
