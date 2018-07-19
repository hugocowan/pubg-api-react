const rp = require('request-promise');
const Season = require('../models/season');

function playerSeason(req, res, next) {
  console.log('Getting season...');
  const tempMatch = [];

  function showNewSeason(seasonData) {
    Season
      .create(seasonData)
      .then(season => res.json(season))
      .catch(next);
  }

  function showOldSeason(seasonData) {
    return res.json(seasonData);
  }

  function checkDB(seasonData) {
    // console.log('tempMatch: ',tempMatch);

    Season
      .find()
      .byName(req.params.username)
      .then(season => {
        const seasonDate = new Date(season[0].attributes.createdAt).getTime();
        const currentDate = new Date().getTime();

        if(season[0] && seasonDate + 60000 >= currentDate){
          season[0].remove();
          return showNewSeason(seasonData);
        } else {
          return showOldSeason(seasonData);
        }

      });
  }

  function getData() {
    Season
      .find()
      .byName(req.params.username)
      .then(season => {
        if(!season[0]) throw 'Too many requests.';
        res.json(season[0]);
      })
      .catch(next);
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
      const seasonData = season.data[0];
      seasonData.name = season.data[0].attributes.name;
      const matches = seasonData.relationships.matches.data;

      matches.forEach(match => {
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
            if(tempMatch.length === matches.length){
              seasonData.matches = tempMatch;
              checkDB(seasonData);
            }
          });
      });
    })
    .catch(next => {
      if(next.message === '429 - undefined'){
        return getData();
      } else return next;
    });
}
