import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';


const MatchInfo = ({ match, getOrdinal, reload, getMap, mapMatch, map }) => {

  const attrs = match.attributes;
  const players = Object.keys(match).filter(key => match[key].name);
  const playDate = new Date(attrs.createdAt);

  console.log(match.info);

  return (
    <div key={match.id} className='matches'>
      <div>
        <p>
          Game Mode: {attrs.gameMode}<br />
          Map: {attrs.mapName}<br />
          Server: {attrs.shardId}<br />
          Duration: {(attrs.duration / 60).toFixed(2)} minutes<br />
          Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.<br />
        </p>
      </div>

      <div>
        <p>
          Team: {players.map((player, index) =>
            <span key={index}>
              {index === 0 ?
                `${match[player].name}, ` : players.length !== index + 1 ?
                  <a
                    onClick = {() => reload(match[player].name)}
                    className='link'
                  >
                    {match[player].name},{' '}
                  </a>:
                  <a
                    onClick = {() => reload(match[player].name)}
                    className='link'
                  >
                    {match[player].name}.
                  </a>}
            </span>)}
          <br />

          Ranking: {getOrdinal(match.player1.winPlace)}

          <br />

          Time survived: {(match.player1.timeSurvived/60).toFixed(2)} minutes.
        </p>
      </div>
      <div className='info'>

        {players.map((player, index) =>
          <div key={index}>
            <p>{`${match[player].name}:`}
              <br />
              Kills – {match[players[index]].kills}.
              <br />
              {match.info && match.info[players[index]] &&
                <span>
                  Average FPS – {parseInt(match[players[index]].avgFPS)}
                  <br />
                </span>}
            </p>
            {match.info && match.info[players[index]].death &&
              <Link
                to = {`/matches/${match.info && match.info[players[index]].death.killer.name}`}
                target='_blank'
                className='link'
              >
                Killed by {match.info && match.info[players[index]].death.killer.name}
              </Link>}
            {match.info && !match.info[players[index]].death &&
              <p></p>
            }
          </div>)}
      </div>

      {typeof match.info === 'object' && !mapMatch &&
      <div className='button'>
        <a onClick={() => getMap(match)}>Show Map</a>
      </div>}
      {mapMatch && mapMatch.id === match.id && !map &&
      <div className='button'>
        <a className='loading'>Loading Map...</a>
      </div>}
      {mapMatch && mapMatch.id !== match.id &&
      <div className='button'>
        <p></p>
      </div>}
    </div>
  );
};

export default MatchInfo;
