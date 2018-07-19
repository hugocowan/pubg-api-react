const rp = require('request-promise');
const Season = require('../models/season');

function playerSeason(req, res, next) {
  console.log('Checking season DB...');

  let oldSeason;
  const matchesArray = [];

  const promise = new Promise(resolve => {
    resolve('This is just to allow for a catch block!');
  });

  Season
    .find()
    .byName(req.params.username)
    .then(season => {
      if(!season[0]) {
        console.log('No old season available. Getting new season...');
        getNewSeason();
      } else {

        const seasonDate = new Date(season[0].attributes.createdAt).getTime();
        const currentDate = new Date().getTime();
        oldSeason = season[0];
        const timer = (seasonDate + 60000 - currentDate)/1000;

        if(timer <= 0){
          console.log('Timer\'s up. Getting new season...');
          getNewSeason();

        } else {
          console.log(`${timer} seconds remaining. Showing old season...`);
          showOldSeason(season[0]);
        }
      }

    })
    .catch(next);


  function showOldSeason(oldSeason) {
    console.log('Season sent.');
    promise
      .then(() => {
        if(!oldSeason) throw 'Too many requests.';
        res.json(oldSeason);
      })
      .catch(next);
  }

  function showNewSeason(seasonData) {
    console.log('Season sent.');
    if(oldSeason) oldSeason.remove();
    Season
      .create(seasonData)
      .then(season => res.json(season))
      .catch(next);
  }

  function getNewSeason() {
    rp({
      method: 'GET',
      url: `https://api.playbattlegrounds.com/shards/pc-eu/players?filter[playerNames]=${req.params.username}`,
      headers: {
        Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        Accept: 'application/vnd.api+json'
      },
      json: true
    })
      .then(season => {
        const seasonData = season.data[0];
        const matches = seasonData.relationships.matches.data;
        seasonData.name = season.data[0].attributes.name;

        matches.forEach(match => {
          rp({
            method: 'GET',
            url: `https://api.playbattlegrounds.com/shards/pc-eu/matches/${match.id}`,
            headers: {
              Accept: 'application/vnd.api+json'
            },
            json: true
          })
            .then(match => {
              const attrs = match.data.attributes;
              const telemetryId = match.data.relationships.assets.data[0].id;
              const maps = {
                Erangel_Main: 'Erangel',
                Desert_Main: 'Miramar',
                Savage_Main: 'Sanhok'
              };

              match.included.forEach(asset => {

                if(asset.id === telemetryId) {

                  matchesArray.push({
                    id: match.data.id,
                    telemetryURL: asset.attributes.URL,
                    createdAt: attrs.createdAt,
                    duration: attrs.duration,
                    gameMode: attrs.gameMode,
                    mapName: maps[attrs.mapName],
                    // isCustomMatch: attrs.isCustomMatch,
                    // stats: attrs.stats,
                    // tags: attrs.tags,
                    // titleId: attrs.titleId,
                    shardId: attrs.shardId
                  });
                }
              });
              if(matchesArray.length === matches.length){
                seasonData.matches = matchesArray;
                showNewSeason(seasonData);
              }
            });
        });
      })
      .catch(next => {
        if(next.message === '429 - undefined'){
          return showOldSeason(oldSeason);
        } else return next;
      });
  }
}

function matchInfo(req, res, next) {

  rp({
    method: 'GET',
    url: `${req.params[0]}`,
    headers: {
      Accept: 'application/vnd.api+json'
    },
    json: true
  })
    .then(matchInfo => res.json(matchInfo))
    .catch(next);
}

module.exports = {
  season: playerSeason,
  match: matchInfo
};
