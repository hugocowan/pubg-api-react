const rp = require('request-promise');
const PlayerSeason = require('../models/playerSeason');


function getPlayerSeasons(req, res, next) {
  console.log('Checking playerSeason DB...');

  const { username, playerId, oldDate } = req.params;

  if(oldDate) return getNewPlayerSeason(null, oldDate);

  console.log('playerId: ', playerId, 'username: ', username);

  const currentDate = JSON.parse(JSON.stringify(new Date())).split('-');
  const date = `${currentDate[0]}-${currentDate[1]}`;

  return PlayerSeason
    .find({ username })
    .then(seasonData => {
      if(!seasonData[0]) {
        console.log('Old playerSeason unavailable. Getting new playerSeason...');
        return getNewPlayerSeason();
      } else {

        const latestSeason = seasonData.filter(data => data.date === date)[0];

        // if(!latestSeason && oldDate) {
        //   console.log('Getting older season...');
        //   return getNewPlayerSeason(null, oldDate);
        // }

        if(!latestSeason) {
          console.log('Current playerSeason unavailable. Getting new playerSeason...');
          return getNewPlayerSeason(seasonData);
        } else {

          const seasonDate = new Date(latestSeason.createdAt).getTime();
          const currentDate = new Date().getTime();
          const timer = (seasonDate + 300000 - currentDate)/1000;

          // if(oldDate && timer <= 0) {
          //   console.log('Getting older season...');
          //   return getNewPlayerSeason(null, oldDate);
          // }

          if(timer <= 0) {
            console.log('Timer\'s up. Getting new seasonData...');
            latestSeason.remove();
            return getNewPlayerSeason(seasonData);
          }
          console.log(`${timer} seconds remaining. Showing old playerSeason...`);
          res.json(seasonData);
        }
      }
    });


  function getNewPlayerSeason(seasonData, oldDate) {

    if(!playerId && seasonData) {
      return res.json(seasonData);
    }

    rp({
      method: 'GET',
      url: `https://api.playbattlegrounds.com/shards/pc-eu/players/${playerId}/seasons/division.bro.official.${oldDate || date}`,
      headers: {
        Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
        Accept: 'application/vnd.api+json'
      },
      json: true
    })
      .then(playerSeason => {
        PlayerSeason
          .create(playerSeason.data.attributes.gameModeStats)
          .then(playerSeason => {
            playerSeason.createdAt = new Date();
            playerSeason.date = oldDate || date;
            playerSeason.username = username;
            return playerSeason.save();
          })
          .then(() => {
            PlayerSeason
              .find({ username })
              .then(playerSeasons => {
                console.log('Player seasons sent.');
                res.json(playerSeasons);
              });
          })
          .catch(next);
      })
      .catch(next);
  }
}

module.exports = {
  getSeasons: getPlayerSeasons
};
