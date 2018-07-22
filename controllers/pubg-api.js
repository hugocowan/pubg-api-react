const rp = require('request-promise');
const Season = require('../models/season');
const Match = require('../models/match');

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
        console.log('error message: ', next.message);
        if(next.message === '429 - undefined' ||
           next.message === 'Error: getaddrinfo ENOTFOUND api.playbattlegrounds.com api.playbattlegrounds.com:443'){
          return showOldSeason(oldSeason);
        } else return next;
      });
  }
}

function matchInfo(req, res, next) {
  console.log('Checking DB...');

  Match
    .findOne({ 'info.matchId': req.params.matchId })
    .then(match => {
      if(!match) {
        console.log('No match found in DB...');
        throw 'No match data in DB';
      }
      console.log('Sending match data from DB.');
      res.json(match);
    })
    .catch(() => {
      console.log('Requesting match data...');
      getMatch();
    });

  function getMatch() {
    rp({
      method: 'GET',
      url: `${req.params[0]}`,
      headers: {
        Accept: 'application/vnd.api+json'
      },
      json: true
    })
      .then(matchInfo => {
        const { username } = req.params;
        const matchData = {};
        const teams = [];
        const id = matchInfo[0].MatchId.split('.');

        function getValues(username) {
          let index = 0;

          matchData[username].coords =
          matchData[username].data.reduce((locationData, data) => {
            let coords;

            data.character ? coords = data.character.location :
              data.attacker && data.attacker.name === username ?
                coords = data.attacker.name :
                data.killer && data.killer.name === username ?
                  coords = data.killer.name :
                  data.victim && data.victim.name === username ?
                    coords = data.victim.name : coords = null;

            const location = {
              coords: coords,
              time: data._D
            };
            locationData.push(location);
            return locationData;
          }, []);

          matchData[username].avgFPS =
          matchData[username].data.reduce((total, data) => {
            if(data.maxFPS) {
              index += 1;
              return total + data.maxFPS;
            } else return total;
          }, 0)/index;

          matchData[username].data.forEach(data => {
            if(data.elapsedTime) matchData[username].time = data.elapsedTime;
          });
        }

        matchInfo.forEach(data => {
          if(data.character && !teams.includes(data.character.teamId))
            teams.push(data.character.teamId);
        });

        // console.log(id);

        matchData.info = {
          matchId: id[id.length-1],
          ping: matchInfo[0].PingQuality,
          date: matchInfo[0]._D,
          teams: teams.length - 1
        };

        matchData[username] = {};

        matchData[username].data = matchInfo.filter(data =>
          (data.character && data.character.name === username) ||
          (data.attacker && data.attacker.name === username) ||
          (data.killer && data.killer.name === username) ||
          (data.victim && data.victim.name === username));

        getValues(username);

        const teamData = matchInfo.filter(data =>
          (data.character && data.character.name !== username &&
           data.character.teamId === matchData[username].data[0].character.teamId) ||
          (data.attacker && data.attacker.name !== username &&
           data.attacker.teamId === matchData[username].data[0].character.teamId) ||
          (data.killer && data.killer.name !== username &&
           data.killer.teamId === matchData[username].data[0].character.teamId) ||
          (data.victim && data.victim.name !== username &&
           data.victim.teamId === matchData[username].data[0].character.teamId));

        teamData.forEach((data) => {
          const username = data.character.name;
          matchData[username] = matchData[username] || {};
          matchData[username].data = matchData[username].data || [];
          matchData[username].data.push(data);
          getValues(username);
        });

        console.log('Filtered match info sent.');
        Match.create(matchData);
        res.json(matchData);
      })
      .catch(next);
  }
}

module.exports = {
  season: playerSeason,
  match: matchInfo
};
