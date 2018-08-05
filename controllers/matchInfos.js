const MatchInfo = require('../models/matchInfo');
const maps = require('./maps');
const Match = require('../models/match');
const { dbURI } = require('../config/environment');

const rp = require('request-promise');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(dbURI, {useNewUrlParser: true});


process.on('message', (params) => {
  console.log('Getting matchInfo...');

  const { username, matchId } = params;
  const url = params[0];

  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  Match
    .findOne({ 'attributes.id': matchId })
    .populate('info')
    .then(match => {
      if(!match) {
        // console.log('No match found in DB...');
        throw 'No match in DB.';
      }

      if(!match.info) {
        // console.log('No match info found in DB...');
        throw 'No match data in DB.';
      }
      const matchInfo = match._doc.info._doc;

      const playerCount = Object.keys(matchInfo)
        .filter(key => matchInfo[key].username);

      const playerNames = playerCount.map((player, index) =>
        matchInfo[`player${index+1}`].username);

      const playerValues = playerNames.map(playerName => {
        return getValues(playerName, playerNames, matchInfo);
      });

      Object.assign(match.info, ...playerValues);

      return match;

    })
    .then(match => {

      console.log('MatchInfo sent from DB.');
      match.save();
      process.send(match);
      mongoose.connection.close();
    })
    .catch((next) => {
      if(next === 'No match data in DB.') {
        getMatchInfo();
      } else if(next === 'No match in DB.') {
        process.send({
          message: 'No match found in the database! Try going back to the homepage.',
          button: 'Home',
          url: '/'
        });
        mongoose.connection.close();
      } else next;
    });



  function getMatchInfo() {
    rp({
      method: 'GET',
      url: url,
      headers: {
        Accept: 'application/vnd.api+json'
      },
      json: true
    })
      .then(matchInfo => filterMatchInfo(matchInfo))
      .catch(next => {
        console.log('getting matchData failed, ', next.message || next);
        if(next.message === 'RequestError: Error: getaddrinfo ENOTFOUND telemetry-cdn.playbattlegrounds.com telemetry-cdn.playbattlegrounds.com:443'){
          process.send({
            message: 'Couldn\'t connect to PUBG\'s servers. Check your internet connection?',
            button: 'Home',
            url: '/'
          });
          mongoose.connection.close();
        }
      });
  }



  async function filterMatchInfo(matchInfo) {

    const playerNames = [username];
    const matchData = {};
    const teams = [];
    const id = matchInfo[0].MatchId.split('.');
    const playerData = {};

    matchInfo.forEach(data => {
      if(data.character && !teams.includes(data.character.teamId))
        teams.push(data.character.teamId);
    });

    matchData.attributes = {
      matchId: id[id.length-1],
      ping: matchInfo[0].PingQuality,
      date: matchInfo[0]._D,
      teams: teams.length
    };

    playerData.player1 = {};

    playerData.player1.data = matchInfo.filter(data =>
      (data.character && data.character.name === username) ||
      (data.attacker && data.attacker.name === username) ||
      (data.killer && data.killer.name === username) ||
      (data.victim && data.victim.name === username));


    const teamData = matchInfo.filter(data =>
      (data.character && data.character.name !== username &&
        data.character.teamId === playerData.player1.data[0].character.teamId) ||
        (data.attacker && data.attacker.name !== username &&
          data.attacker.teamId === playerData.player1.data[0].character.teamId) ||
          (data.killer && data.killer.name !== username &&
            data.killer.teamId === playerData.player1.data[0].character.teamId) ||
            (data.victim && data.victim.name !== username &&
              data.victim.teamId === playerData.player1.data[0].character.teamId));


    teamData.forEach((data) => {
      let username;

      data.character && !playerNames.includes(data.character.name) ?
        playerNames.push(data.character.name) :
        data.attacker && playerNames.includes(data.attacker.name) ?
          username = data.attacker.name :
          data.killer && playerNames.includes(data.killer.name) ?
            username = data.killer.name :
            data.victim && playerNames.includes(data.victim.name) ?
              username = data.victim.name : username = data.character.name;

      const player = `player${playerNames.indexOf(username) + 1}`;

      playerData[player] = playerData[player] || {};
      playerData[player].data = playerData[player].data || [];
      playerData[player].data.push(data);
    });

    await asyncForEach(playerNames, async (username) =>
      await getValues(username, playerNames, matchData, playerData));

    console.log('MatchInfo sent from PUBG API.');

    MatchInfo
      .create(matchData)
      .then(matchData => {
        Match
          .findOne({ 'attributes.id': matchId })
          .then(match => {
            match.info = matchData;
            match.save();
            process.send(match);
            mongoose.connection.close();
          });
      });
  }



  async function getValues(playerName, playerNames, matchData, playerData) {

    //To add a new property, add it in the schema too as an object.
    //The if statements make sure the property is only calculated once.
    //This avoids redoing properties and allows for new properties to be added.
    return new Promise((resolve) => {


      let index = 0;
      const player = `player${playerNames.indexOf(playerName) + 1}`;

      if(player === 'player1' && playerName !== username)
        playerName = username;

      matchData[player] = matchData[player] || {};

      if(playerData && (matchData[player].username !== playerName ||
        !matchData[player].mapData)){

        const playerCoords = playerData[player].data.reduce((locationData, data) => {

          const coords = data.character ? data.character.location :
            data.attacker && data.attacker.name === playerName &&
            data.attacker.location.x !== 0 ?
              data.attacker.location :
              data.killer && data.killer.name === playerName ?
                data.killer.location :
                data.victim && data.victim.name === playerName ?
                  data.victim.location : null;

          const location = {
            coords: coords,
            time: data._D
          };
          if(location.coords) locationData.push(location);
          return locationData;
        }, []);

        maps
          .getMap(playerCoords)
          .then(data => {
            matchData[player].mapData = data;
            resolve(matchData);
          })
          .catch(err => console.log('error in map generation: ', err));
      }


      if (playerData && (matchData[player].username !== playerName ||
         !matchData[player].death)) matchData[player].death =
          playerData[player].data.reduce((deathData, data) => {
            if(data.killer &&
              data.victim.name === playerName &&
              data._T === 'LogPlayerKill'){
              deathData = data;
            }
            return deathData;
          }, {});

      if (playerData && (matchData[player].username !== playerName ||
         !matchData[player].kills)) matchData[player].kills =
        playerData[player].data.reduce((killData, data) => {
          if(data.killer &&
            data.killer.name === playerName &&
            data._T === 'LogPlayerKill'){
            killData.push(data);
          }
          return killData;
        }, []);

      if (playerData && (matchData[player].username !== playerName ||
         !matchData[player].avgFPS)) matchData[player].avgFPS =
          playerData[player].data.reduce((total, data) => {
            if(data.maxFPS) {
              index += 1;
              return total + data.maxFPS;
            } else return total;
          }, 0)/index;


      if (playerData && (matchData[player].username !== playerName ||
         matchData[player].time)) playerData[player].data.forEach(data => {
        if(data.elapsedTime) matchData[player].time = data.elapsedTime;
      });

      if (matchData[player].username !== playerName ||
         !matchData[player].username) matchData[player].username = username;

    });
  }

});
