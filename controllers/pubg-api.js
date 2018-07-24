const rp = require('request-promise');
const Season = require('../models/season');
const Match = require('../models/match');
const maps = require('./maps');

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

      const matchInfo = match._doc;

      const playerCount = Object.keys(matchInfo)
        .filter(key => matchInfo[key].username)
        .map(playerName => playerName);

      const playerNames = playerCount.map((player, index) =>
        matchInfo[`player${index+1}`].username);

      const matchFilter = playerNames.map(username => {
        return getValues(username, playerNames, matchInfo);
      });

      return Object.assign(match, ...matchFilter);

    })
    .then(match => {
      const mapData = maps.getMap([1,2,3,4,5,6,7,8,9]);

      console.log('mapData: ', mapData);
      match.save();
      console.log('Sending match data from DB.');
      res.json(match);
    })
    .catch((next) => {
      console.log('Requesting match data, ', `next.message: '${next.message}'.` || 'no errors...');
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
      .then(matchInfo => filterMatch(matchInfo))
      .catch(next);
  }



  function filterMatch(matchInfo) {

    const { username } = req.params;
    const playerNames = [username];
    const matchData = {};
    const teams = [];
    const id = matchInfo[0].MatchId.split('.');


    matchInfo.forEach(data => {
      if(data.character && !teams.includes(data.character.teamId))
        teams.push(data.character.teamId);
    });

    matchData.info = {
      matchId: id[id.length-1],
      ping: matchInfo[0].PingQuality,
      date: matchInfo[0]._D,
      teams: teams.length - 1
    };

    matchData.player1 = {};

    matchData.player1.data = matchInfo.filter(data =>
      (data.character && data.character.name === username) ||
      (data.attacker && data.attacker.name === username) ||
      (data.killer && data.killer.name === username) ||
      (data.victim && data.victim.name === username));

    getValues(username, playerNames, matchData);

    const teamData = matchInfo.filter(data =>
      (data.character && data.character.name !== username &&
       data.character.teamId === matchData.player1.data[0].character.teamId) ||
      (data.attacker && data.attacker.name !== username &&
       data.attacker.teamId === matchData.player1.data[0].character.teamId) ||
      (data.killer && data.killer.name !== username &&
       data.killer.teamId === matchData.player1.data[0].character.teamId) ||
      (data.victim && data.victim.name !== username &&
       data.victim.teamId === matchData.player1.data[0].character.teamId));


    teamData.forEach((data) => {
      let username;

      data.character && !playerNames.includes(data.character.name) ?
        (username = data.character.name, playerNames.push(username)) :
        data.attacker && playerNames.includes(data.attacker.name) ?
          username = data.attacker.name :
          data.killer && playerNames.includes(data.killer.name) ?
            username = data.killer.name :
            data.victim && playerNames.includes(data.victim.name) ?
              username = data.victim.name : username = data.character.name;

      const player = `player${playerNames.indexOf(username) + 1}`;

      matchData[player] = matchData[player] || {};
      matchData[player].data = matchData[player].data || [];
      matchData[player].data.push(data);
    });

    playerNames.forEach(username =>
      getValues(username, playerNames, matchData));

    console.log('Filtered match info sent.');

    Match.create(matchData);
    res.json(matchData);
  }



  function getValues(username, playerNames, matchData) {

    //To add a new property, add it in the schema too as an object.
    //The if statements make sure the property is only calculated once.
    //This avoids redoing properties and allows for new properties to be added.

    console.log('Filtering player data...');
    let index = 0;
    const player = `player${playerNames.indexOf(username) + 1}`;

    if (!matchData[player].coords) matchData[player].coords =
    matchData[player].data.reduce((locationData, data) => {

      const coords = data.character ? data.character.location :
        data.attacker && data.attacker.name === username ?
          data.attacker.location :
          data.killer && data.killer.name === username ?
            data.killer.location :
            data.victim && data.victim.name === username ?
              data.victim.location : null;

      const location = {
        coords: coords,
        time: data._D
      };
      locationData.push(location);
      return locationData;
    }, []);

    if (!matchData[player].death) matchData[player].death =
    matchData[player].data.reduce((deathData, data) => {
      if(data.killer &&
         data.victim.name === username &&
         data._T === 'LogPlayerKill'){
        deathData = data;
      }
      return deathData;
    }, {});

    if (!matchData[player].kills) matchData[player].kills =
    matchData[player].data.reduce((killData, data) => {
      if(data.killer &&
         data.killer.name === username &&
         data._T === 'LogPlayerKill'){
        killData.push(data);
      }
      return killData;
    }, []);

    if (!matchData[player].avgFPS) matchData[player].avgFPS =
    matchData[player].data.reduce((total, data) => {
      if(data.maxFPS) {
        index += 1;
        return total + data.maxFPS;
      } else return total;
    }, 0)/index;


    if (!matchData[player].time) matchData[player].data.forEach(data => {
      if(data.elapsedTime) matchData[player].time = data.elapsedTime;
    });

    if (!matchData[player].username) matchData[player].username = username;

  }
}

module.exports = {
  season: playerSeason,
  match: matchInfo
};
