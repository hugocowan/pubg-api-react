import React from 'react';


const PlayerSeason = ({
  seasonData, handleChange, gameModeFPP, handleSeasonChange, selectValue, getValue, selectSeason }) => {

  const selectedSeason = selectSeason || seasonData.filter(data => {
    // console.log(data.date);
    return (data.date === selectValue || data.date === '2018-08');
  })[0];


  const killDeathRatio = function(gameMode) {
    const kDR = selectedSeason[gameMode].kills /
    (selectedSeason[gameMode].roundsPlayed - selectedSeason[gameMode].wins);
    return kDR.toFixed(2);
  };
  const killsDeathsAssists = function(gameMode) {
    const kDA = (selectedSeason[gameMode].kills + selectedSeason[gameMode].assists) /
    (selectedSeason[gameMode].roundsPlayed - selectedSeason[gameMode].wins);
    return kDA.toFixed(2);
  };



  return (
    <div className='blue stats'>
      <div className='button'>
        <label htmlFor='season'>Available seasons: </label>
        <select
          value = {selectValue}
          onChange = {(e) => handleSeasonChange(e)}
          onLoad = {getValue()}
          id='season'
        >
          {seasonData
            .sort((a,b) => new Date(b.date) - new Date(a.date))
            .map(season =>
              <option value={season.date} key={season.id}>
                Season {season.date.split('-')[1]}
              </option>)}
          <option value='new'>Get previous Season</option>
        </select>
      </div>
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
      {selectedSeason && Object
        .keys(selectedSeason)
        .filter(key => {
          if(gameModeFPP) return key.includes('fpp');
          return (typeof selectedSeason[key] === 'object' &&
                  !key.includes('fpp'));
        })
        .map(gameMode =>
          <div key={gameMode}>
            <h3>{gameMode}</h3>
            <p>
              Kills: {selectedSeason[gameMode].kills}<br />
              Longest Kill: {selectedSeason[gameMode].longestKill.toFixed(2)}m<br />
              Headshot Kills: {selectedSeason[gameMode].headshotKills}<br />
              Max KillStreak: {selectedSeason[gameMode].maxKillStreaks}<br />
              Max KillStreak: {selectedSeason[gameMode].maxKillStreaks}<br />
              Games Played: {selectedSeason[gameMode].roundsPlayed}<br />
              KDR: {killDeathRatio(gameMode) || 0}<br />
              KDA: {killsDeathsAssists(gameMode) || 0}<br />
            </p>
          </div>
        )}
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
