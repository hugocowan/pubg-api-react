import React from 'react';

const PlayerSeason = ({ seasonData, handleChange, gameModeFPP }) => {

  const killDeathRatio = function(gameMode) {
    const kDR = seasonData[gameMode].kills /
    (seasonData[gameMode].roundsPlayed - seasonData[gameMode].wins);
    return kDR.toFixed(2);
  };
  const killsDeathsAssists = function(gameMode) {
    const kDA = (seasonData[gameMode].kills + seasonData[gameMode].assists) /
    (seasonData[gameMode].roundsPlayed - seasonData[gameMode].wins);
    return kDA.toFixed(2);
  };


  return (
    <div className='blue stats'>
      <div>
        <label htmlFor='gameMode'>GameMode: </label>
        <div className="radio">
          <label>
            <input type="radio"
              checked={gameModeFPP}
              onChange={handleChange} />
              FPP
          </label>
        </div>
        <div className="radio">
          <label>
            <input type="radio"
              checked={!gameModeFPP}
              onChange={handleChange} />
              TPP
          </label>
        </div>
      </div>
      {Object
        .keys(seasonData)
        .filter(key => {
          if(gameModeFPP) return key.includes('fpp');
          return (typeof seasonData[key] === 'object' &&
                  !key.includes('fpp'));
        })
        .map(gameMode =>
          <div key={gameMode}>
            <h3>{gameMode}</h3>
            <p>
              Kills: {seasonData[gameMode].kills}<br />
              Longest Kill: {seasonData[gameMode].longestKill.toFixed(2)}m<br />
              Headshot Kills: {seasonData[gameMode].headshotKills}<br />
              Max KillStreak: {seasonData[gameMode].maxKillStreaks}<br />
              Max KillStreak: {seasonData[gameMode].maxKillStreaks}<br />
              Games Played: {seasonData[gameMode].roundsPlayed}<br />
              KDR: {killDeathRatio(gameMode) || 0}<br />
              KDA: {killsDeathsAssists(gameMode) || 0}<br />
            </p>
          </div>)}
    </div>
  );
};
// assists:1
// boosts:31
// dBNOs:0
// dailyKills:7
// damageDealt:4199.7285
// days:8
// headshotKills:8
// heals:42
// killPoints:1332.2987
// longestTimeSurvived:1584.749
// losses:31
// mostSurvivalTime:1584.749
// revives:0
// rideDistance:5738.3774
// roadKills:0
// roundMostKills:4
// roundsPlayed:31
// suicides:0
// teamKills:0
// timeSurvived:19801.658
// top10s:2
// vehicleDestroys:0
// walkDistance:42536.117
// weaponsAcquired:119
// weeklyKills:26
// winPoints:1522.5306
// wins:0

export default PlayerSeason;
