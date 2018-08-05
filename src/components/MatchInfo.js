import React from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';


const MatchInfo = ({ match, getOrdinal, reload, getMap, map }) => {

  const attrs = match.attributes;
  const players = Object.keys(match).filter(key => match[key].name);
  const playDate = new Date(attrs.createdAt);

  return (
    <div key={match.id} className='matches'>
      <div>
        <p>Game Mode: {attrs.gameMode}</p>
        <p>Map: {attrs.mapName}</p>
        <p>Server: {attrs.shardId}</p>
        <p>Duration: {(attrs.duration / 60).toFixed(2)} minutes</p>
        <p>Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.</p>
      </div>

      <div className='info'>
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

        {players.map((player, index) =>
          <div key={index}>
            <p>{`${match[player].name}:`}
              <br />
              Kills – {match[players[index]].kills}.
              <br />
              {match.info && match.info[players[index]].avgFPS &&
                <span>
                  Average FPS – {parseInt(match[players[index]].avgFPS)}
                  <br />
                </span>}
            </p>
            {match.info && match.info[players[index]].death &&
            <div className='button'>
              <Link
                to = {`/matches/${match.info && match.info[players[index]].death.killer.name}`}
                target='_blank'
              >
                Killed by {match.info && match.info[players[index]].death.killer.name}
              </Link>
            </div>}
          </div>)}
      </div>

      {typeof match.info === 'object' && !map &&
      <div className='button'>
        <a onClick={() => getMap(match)}>Show Map</a>
      </div>}
    </div>
  );
};

export default MatchInfo;
