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
    .findOne({ 'id': matchId })
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

      console.log('MatchInfo sent from DB.');
      match.save();
      process.send(match);
    })
    .catch((next) => {
      // console.log('Requesting match data, ', next.message ||
      // next || 'no errors...');
      if(next === 'No match data in DB.') {
        getMatchInfo();
      } else if(next === 'No match in DB.') {
        process.send({
          message: 'No match found in the database! Try going back to the homepage.',
          button: 'Home',
          url: '/'
        });
      } else next;
    });



  function getMatchInfo() {
    // console.log('Getting matchData from PUBG API...');
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
        if(next.message === 'Error: getaddrinfo ENOTFOUND telemetry-cdn.playbattlegrounds.com telemetry-cdn.playbattlegrounds.com:443'){
          console.log('Couldn\'t connect to PUBG\'s servers. Check your internet connection?');
        }
      });
  }



  async function filterMatchInfo(matchInfo) {

    // console.log('Filtering new data...');

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
      teams: teams.length
    };

    matchData.player1 = {};

    matchData.player1.data = matchInfo.filter(data =>
      (data.character && data.character.name === username) ||
      (data.attacker && data.attacker.name === username) ||
      (data.killer && data.killer.name === username) ||
      (data.victim && data.victim.name === username));

    // await getValues(username, playerNames, matchData);

    const teamData = matchInfo.filter(data => {
      // console.log('player 1\'s teamId: ', matchData.player1.data);

      (data.character && data.character.name !== username &&
        data.character.teamId === matchData.player1.data[0].character.teamId) ||
        (data.attacker && data.attacker.name !== username &&
          data.attacker.teamId === matchData.player1.data[0].character.teamId) ||
          (data.killer && data.killer.name !== username &&
            data.killer.teamId === matchData.player1.data[0].character.teamId) ||
            (data.victim && data.victim.name !== username &&
              data.victim.teamId === matchData.player1.data[0].character.teamId);

    });


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

    console.log('MatchInfo sent from PUBG API.');

    MatchInfo
      .create(matchData)
      .then(matchData => {
        Match
          .findOne({ 'id': matchId })
          .then(match => {
            match.info = matchData;
            match.save();
            process.send(match);
          });
      });
  }



  async function getValues(username, playerNames, matchData) {

    //To add a new property, add it in the schema too as an object.
    //The if statements make sure the property is only calculated once.
    //This avoids redoing properties and allows for new properties to be added.
    return new Promise((resolve) => {
      // console.log('Getting values from player data...');

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
        // console.log('getting map data...');
        maps
          .getMap(matchData[player].coords)
          .then(data => {
            matchData[player].mapData = data;
            console.log('Data values created.');
            // console.log(matchData);
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

});
