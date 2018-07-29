const rp = require('request-promise');
const Season = require('../models/season');
const MatchInfo = require('../models/matchInfo');
const Match = require('../models/match');
const maps = require('./maps');

//I want to make a season containing all match info.
//The season's ID is based off of the year/month.
//The season contains all matches.
//Each match contains all matchInfo.

function playerSeason(req, res, next) {
  console.log('Checking season DB...');

  let oldSeason;
  let stillMore = true;

  Season
    .find()
    .byName(req.params.username)
    .populate('matches')
    .then(season => {
      if(!season[0]) {
        console.log('No old season available. Getting new season...');
        getNewSeason();
      } else {

        oldSeason = season[0];
        const seasonDate = new Date(season[0].attributes.createdAt).getTime();
        const currentDate = new Date().getTime();
        const timer = (seasonDate + 60000 - currentDate)/1000;

        if(timer){
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

    new Promise((resolve, reject) => {
      if(!oldSeason) reject('Too many requests.');
      resolve(res.json(oldSeason));
    })
      .catch(next => console.log(next.message || next));
  }

  function createSeason(seasonData, matches, newMatches, oldMatches) {

    if(stillMore && (newMatches.length + oldMatches.length === matches.length)){
      console.log('All matches received. Sending matches.');

      stillMore = false;

      Match
        .create(newMatches)
        .then(newMatches => {
          Season
            .create(seasonData)
            .then(season => {

              if(oldMatches && oldMatches[0])
                oldMatches.forEach(match =>
                  season.matches.push(match));
              if(newMatches && newMatches[0])
                newMatches.forEach(match =>
                  season.matches.push(match));
              Object.assign(season, seasonData);

              return season.save();
            })
            .then(seasonData => showNewSeason(seasonData));
        })
        .catch(next);
    }
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
        console.log('Season received. Getting matches...');

        const seasonData = season.data[0];
        const seasonTime = seasonData.attributes.createdAt.split('-');
        const matches = seasonData.relationships.matches.data;
        const newMatches = [];
        const oldMatches = [];

        seasonData.name = season.data[0].attributes.name;
        seasonData.date = `${seasonTime[0]}-${seasonTime[1]}`;

        if(!seasonData.relationships.matches.data[0])
          throw 'No matches available! Play a match and then come back. It can take a while for PUBG to record it!';

        matches.forEach(match => {
          Match
            .find({id: match.id})
            .then(matchData => {
              if(matchData[0]) {
                oldMatches.push(matchData[0]);
              } else return match;
            })
            .then((match) => {
              if(!match) {
                return createSeason(seasonData, matches, newMatches, oldMatches);
              } else if(!match) return null;
              // console.log('match: ', match);
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

                      newMatches.push({
                        id: match.data.id,
                        telemetryURL: asset.attributes.URL,
                        createdAt: attrs.createdAt,
                        duration: attrs.duration,
                        gameMode: attrs.gameMode,
                        mapName: maps[attrs.mapName],
                        // isCustomMatchInfo: attrs.isCustomMatchInfo,
                        // stats: attrs.stats,
                        // tags: attrs.tags,
                        // titleId: attrs.titleId,
                        shardId: attrs.shardId
                      });
                    }
                  });
                  createSeason(seasonData, matches, newMatches, oldMatches);
                });
            });
        });
      })
      .catch(next => {
        console.log('error message: ', next.message || next);
        if(next.message === '429 - undefined' ||
           next.message === 'Error: getaddrinfo ENOTFOUND api.playbattlegrounds.com api.playbattlegrounds.com:443'){
          return showOldSeason(oldSeason);
        } else res.json({message: next.message || next});
      });
  }
}


function matchInfo(req, res) {
  console.log('Checking DB...');

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  Match
    .findOne({ 'id': req.params.matchId })
    .populate('info')
    .then(match => {
      if(!match) {
        console.log('No match found in DB...');
        throw 'No match in DB.';
      }

      if(!match.info) {
        console.log('No match info found in DB...');
        throw 'No match data in DB.';
      }
      const matchInfo = match._doc.info._doc;

      const playerCount = Object.keys(matchInfo)
        .filter(key => matchInfo[key].username)
        .map(playerName => playerName);

      const playerNames = playerCount.map((player, index) =>
        matchInfo[`player${index+1}`].username);

      const playerValues = playerNames.map(username => {
        return getValues(username, playerNames, matchInfo);
      });

      Object.assign(match.info, ...playerValues);

      return match;

    })
    .then(match => {

      console.log('MatchInfo data sent from DB.');
      match.save();
      res.json(match);
    })
    .catch((next) => {
      console.log('Requesting match data, ', next.message ||
      next || 'no errors...');
      if(next === 'No match data in DB.') {
        getMatchInfo();
      } else if(next === 'No match in DB.') {
        res.json({
          message: 'No match found in the database! Try going back to the homepage.',
          button: 'Home',
          url: '/'
        });
      } else next;
    });



  function getMatchInfo() {
    console.log('Getting matchData from PUBG API...');
    rp({
      method: 'GET',
      url: `${req.params[0]}`,
      headers: {
        Accept: 'application/vnd.api+json'
      },
      json: true
    })
      .then(matchInfo => filterMatchInfo(matchInfo))
      .catch(next => {
        console.log('getting matchData failed, ', next.message || next);
        if(next.message === 'Error: getaddrinfo ENOTFOUND telemetry-cdn.playbattlegrounds.com telemetry-cdn.playbattlegrounds.com:443'){
          res.json({ message: 'Couldn\'t connect to PUBG\'s servers. Check your internet connection?' });
        }
      });
  }



  async function filterMatchInfo(matchInfo) {

    console.log('Filtering new data...');

    const { username, matchId } = req.params;
    const playerNames = [username];
    const matchData = {};
    const teams = [];
    const id = matchInfo[0].MatchId.split('.');


    matchInfo.forEach(data => {
      if(data.character && !teams.includes(data.character.teamId))
        teams.push(data.character.teamId);
    });

    matchData.attributes = {
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

    // await getValues(username, playerNames, matchData);

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

    await asyncForEach(playerNames, async (username) =>
      await getValues(username, playerNames, matchData));

    console.log('Filtered match info sent.');

    MatchInfo
      .create(matchData)
      .then(matchData => {
        Match
          .findOne({ 'id': matchId })
          .then(match => {
            match.info = matchData;
            match.save();
            res.json(match);
          });
      });
  }



  async function getValues(username, playerNames, matchData) {

    //To add a new property, add it in the schema too as an object.
    //The if statements make sure the property is only calculated once.
    //This avoids redoing properties and allows for new properties to be added.
    return new Promise((resolve) => {
      console.log('Getting values from player data...');

      let index = 0;
      const player = `player${playerNames.indexOf(username) + 1}`;

      if (!matchData[player].coords) matchData[player].coords =
      matchData[player].data.reduce((locationData, data) => {

        const coords = data.character ? data.character.location :
          data.attacker && data.attacker.name === username &&
          data.attacker.location.x !== 0 ?
            data.attacker.location :
            data.killer && data.killer.name === username ?
              data.killer.location :
              data.victim && data.victim.name === username ?
                data.victim.location : null;

        const location = {
          coords: coords,
          time: data._D
        };
        if(location.coords) locationData.push(location);
        return locationData;
      }, []);


      if(!matchData[player].mapData){
        console.log('getting map data...');
        maps
          .getMap(matchData[player].coords)
          .then(data => {
            matchData[player].mapData = data;
            console.log('Data values created.');
            resolve(matchData);
          })
          .catch(err => console.log('error in map generation: ', err));
      }


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

    });
  }

}

module.exports = {
  season: playerSeason,
  match: matchInfo
};
