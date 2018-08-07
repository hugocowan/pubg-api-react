const rp = require('request-promise');
const MatchList = require('../models/matchList');
const Match = require('../models/match');
const MatchInfo = require('../models/matchInfo'); // eslint-disable-line


function getMatchList(req, res, next) {
  console.log('Checking matchList DB...');

  let oldMatchList;
  let stillMore = true;
  const { username } = req.params;

  MatchList
    .find()
    .byName(username)
    .populate({
      path: 'matches playerSeason',
      populate: { path: 'info' }
    })
    .then(matchList => {
      if(!matchList[0]) {
        console.log('No old matchList available. Getting new matchList...');
        getNewMatchList();
      } else {

        oldMatchList = matchList[0];
        const matchListDate = new Date(matchList[0].attributes.createdAt).getTime();
        const currentDate = new Date().getTime();
        const timer = (matchListDate + 60000 - currentDate)/1000;

        if(timer <= 0){
          console.log('Timer\'s up. Getting new matchList...');
          getNewMatchList();

        } else {
          console.log(`${timer} seconds remaining. Showing old matchList...`);
          showOldMatchList(matchList[0]);
        }

      }

    })
    .catch(next);

  function createMatchList(matchList, matches, newMatches, oldMatches) {

    if(stillMore && (newMatches.length + oldMatches.length === matches.length)){
      stillMore = false;

      Match
        .create(newMatches)
        .then(newMatches => {
          const newMatchData = newMatches;
          return MatchList
            .create(matchList)
            .then(matchList => {
              if (oldMatches && oldMatches[0]) oldMatches.forEach(match =>
                matchList.matches.push(match));
              if (newMatchData && newMatchData[0]) newMatchData.forEach(match =>
                matchList.matches.push(match));
              return matchList.save();
            });
        })
        .then(matchData => {
          if(oldMatchList) oldMatchList.remove();
          res.json(matchData);
        })
        .catch(next);
    }
  }

  function showOldMatchList(oldMatchList) {

    new Promise((resolve, reject) => {
      if(!oldMatchList) reject('Too many requests.');
      resolve(res.json(oldMatchList));
    })
      .catch(next => console.log(next.message || next));
  }

  function getNewMatchList() {

    rp({
      method: 'GET',
      url: `https://api.playbattlegrounds.com/shards/pc-eu/players?filter[playerNames]=${username}`,
      headers: {
        Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        Accept: 'application/vnd.api+json'
      },
      json: true
    })
      .then(list => {
        const matchList = list.data[0];
        const matchListTime = matchList.attributes.createdAt.split('-');
        const matches = matchList.relationships.matches.data;
        const newMatches = [];
        const oldMatches = [];

        matchList.name = list.data[0].attributes.name;
        matchList.date = `${matchListTime[0]}-${matchListTime[1]}`;

        if(!matchList.relationships.matches.data[0])
          return res.json({
            message: 'No matches available! Play a match and then come back. It can take a while for PUBG to record it!',
            id: matchList.id
          });

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
                return createMatchList(matchList, matches, newMatches, oldMatches);
              } else if(!match) return null;

              rp({
                method: 'GET',
                url: `https://api.playbattlegrounds.com/shards/pc-eu/matches/${match.id}`,
                headers: {
                  Accept: 'application/vnd.api+json'
                },
                json: true
              })
                .then(async match => {
                  const attrs = match.data.attributes;
                  const telemetryId = match.data.relationships.assets.data[0].id;
                  const date = attrs.createdAt.split('-');
                  const maps = {
                    Erangel_Main: 'Erangel',
                    Desert_Main: 'Miramar',
                    Savage_Main: 'Sanhok'
                  };

                  const matchStats = await new Promise(resolve => {

                    const matchStats = match.included.reduce((total, asset) => {
                      total.player1 = total.player1 || {};
                      total.attributes = total.attributes || {};

                      if(asset.id === telemetryId) {

                        total.attributes = {
                          id: match.data.id,
                          telemetryURL: asset.attributes.URL,
                          createdAt: attrs.createdAt,
                          date: `${date[0]}-${date[1]}`,
                          duration: attrs.duration,
                          gameMode: attrs.gameMode,
                          mapName: maps[attrs.mapName],
                          shardId: attrs.shardId
                        };
                      }

                      if(asset.type === 'participant' &&
                         asset.attributes.stats.name === username) {
                        total.player1 = {
                          id: asset.id,
                          ...asset.attributes.stats
                        };
                      }

                      return total;
                    }, {});
                    resolve(matchStats);
                  })
                    .then(async matchStats => {
                      await new Promise(resolve => {
                        match.included.forEach(asset => {

                          if(asset.type === 'roster' &&
                        asset.relationships.participants.data.filter(player =>
                          player.id === matchStats.player1.id)[0]) {
                            matchStats.player1.teamId = asset.attributes.stats.teamId;
                            const teamMates = asset.relationships.participants.data
                              .filter(player => player.id !== matchStats.player1.id);

                            if(!teamMates[0]) return resolve();

                            teamMates.forEach((player, index) => {
                              matchStats[`player${index + 2}`] = {};
                              matchStats[`player${index + 2}`].id = player.id;
                              index + 1 === teamMates.length ? resolve() : null;
                            });
                          }
                        });
                      });
                      return matchStats;
                    })
                    .then(async matchStats => {
                      await new Promise(resolve => {
                        const teamMates = Object.keys(matchStats).filter(key =>
                          key.match(/2|3|4/));

                        if(!teamMates[0]) return resolve();

                        teamMates.forEach((player, index) =>
                          match.included.forEach(asset => {
                            if(asset.type === 'participant' &&
                               asset.id === matchStats[player].id) {
                              matchStats[player] = {
                                id: asset.id,
                                ...asset.attributes.stats
                              };
                            }
                            index + 1 === teamMates.length ? resolve() : null;
                          }));
                      });
                      return matchStats;
                    });
                  newMatches.push(matchStats);
                  console.log('newMatches: ', newMatches);
                  // console.log('matchList', matchList);


                  createMatchList(matchList, matches, newMatches, oldMatches);
                });
            });
        });
      })
      .catch(next => {
        console.log('error message: ', next.message || next);
        if(next.message === '429 - undefined' ||
           next.message === 'Error: getaddrinfo ENOTFOUND api.playbattlegrounds.com api.playbattlegrounds.com:443' ||
           next.message === 'Error: read ETIMEDOUT'){
          try {
            return showOldMatchList(oldMatchList);
          } catch(err) {
            console.log(err);
          }
        } else res.json({message: next.message || next});
      });
  }
}

function getMatchInfo(req, res) {
  const { fork } = require('child_process');
  const matchData = fork('controllers/matchInfos.js');
  matchData.on('message', (matchInfo) => {
    matchData.kill('SIGINT');
    res.json(matchInfo);
  });
  matchData.send(req.params);
}

module.exports = {
  getList: getMatchList,
  getInfo: getMatchInfo
};
