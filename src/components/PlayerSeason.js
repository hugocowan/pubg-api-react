import React from 'react';

const PlayerSeason = ({ seasonData }) => {

  const killDeathRatio = function(matchType) {
    const kDR = seasonData[matchType].kills /
    (seasonData[matchType].roundsPlayed - seasonData[matchType].wins);
    return kDR.toFixed(2);
  };
  const killsDeathsAssists = function(matchType) {
    const kDA = (seasonData[matchType].kills + seasonData[matchType].assists) /
    (seasonData[matchType].roundsPlayed - seasonData[matchType].wins);
    return kDA.toFixed(2);
  };

  return (
    <div className='blue stats'>
      <div>
        <h3>Solo-FPP</h3>
        <p>
          Kills: {seasonData['solo-fpp'].kills}<br />
          Longest Kill: {seasonData['solo-fpp'].longestKill.toFixed(2)}m<br />
          Headshot Kills: {seasonData['solo-fpp'].headshotKills}<br />
          Max KillStreak: {seasonData['solo-fpp'].maxKillStreaks}<br />
          Max KillStreak: {seasonData['solo-fpp'].maxKillStreaks}<br />
          Games Played: {seasonData['solo-fpp'].roundsPlayed}<br />
          KDR: {killDeathRatio('solo-fpp')}<br />
          KDA: {killsDeathsAssists('solo-fpp')}<br />
        </p>
      </div>
      <div>
        <h3>Duo-FPP</h3>
        <p>
          Kills: {seasonData['duo-fpp'].kills}<br />
          Longest Kill: {seasonData['duo-fpp'].longestKill.toFixed(2)}m<br />
          Headshot Kills: {seasonData['duo-fpp'].headshotKills}<br />
          Max KillStreak: {seasonData['duo-fpp'].maxKillStreaks}<br />
          Max KillStreak: {seasonData['duo-fpp'].maxKillStreaks}<br />
          Games Played: {seasonData['duo-fpp'].roundsPlayed}<br />
          KDR: {killDeathRatio('duo-fpp')}<br />
          KDA: {killsDeathsAssists('duo-fpp')}<br />
        </p>
      </div>
      <div>
        <h3>Squad-FPP</h3>
        <p>
          Kills: {seasonData['squad-fpp'].kills}<br />
          Longest Kill: {seasonData['squad-fpp'].longestKill.toFixed(2)}m<br />
          Headshot Kills: {seasonData['squad-fpp'].headshotKills}<br />
          Max KillStreak: {seasonData['squad-fpp'].maxKillStreaks}<br />
          Max KillStreak: {seasonData['squad-fpp'].maxKillStreaks}<br />
          Games Played: {seasonData['squad-fpp'].roundsPlayed}<br />
          KDR: {killDeathRatio('squad-fpp')}<br />
          KDA: {killsDeathsAssists('squad-fpp')}<br />
        </p>
      </div>
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
