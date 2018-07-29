import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import Navbar from './Navbar';

class Index extends React.Component{
  state = {
    sort: 'createdAt|desc',
    search: '',
    username: this.props.match.params.username
  };

  componentDidMount(){
    axios
      .get(`/api/${this.state.username}`)
      .then(res => this.setState({ matchList: res.data }, () => {
        console.log(this.state);
        if (!Object.keys(this.state.matchList).includes('message')) {
          const { matchList } = this.state;
          const matches = [ ...matchList.matches ];
          this.state.matchList.matches.forEach((match, index) => {
            if (!match.info || typeof match.info === 'string') {
              // console.log(match);
              axios
                .get(`/api/telemetry/${this.state.username}/${match.id}/${match.telemetryURL}`)
                .then(res => {
                  matches[index] = res.data;
                  this.setState({ ...this.state, matchList: { ...matchList, matches } }, () => {
                    // console.log(this.state);
                  });
                });
            }
          });
        }
      }));
  }

  sortAndFilter = () => {
    const [field, dir] = this.state.sort.split('|');
    const re = new RegExp(this.state.search, 'i');
    const filtered = _.filter(this.state.matchList.matches, match => {
      return re.test(match.createdAt) ||
             re.test(match.mapName) ||
             re.test(match.gameMode);
    });
    return _.orderBy(filtered, field, dir);
  }

  getOrdinal = (number) => {
    var suffix=['th','st','nd','rd'],
      value=number%100;
    return number+(suffix[(value-20)%10]||suffix[value]||suffix[0]);
  }

  render(){

    let player;

    if (this.state.matchList) {
      player = this.state.matchList.playerSeason;
    }

    if(!this.state.matchList){
      return (
        <div>
          <Navbar
            button='Home'
            url='/'
          />
          <div className='index'>
            <p>Loading... Hey. How are you doing. {'I\'m'} alright. If this takes a while, the username you typed may be incorrect.</p>
          </div>
        </div>
      );
    }
    return(
      <div>
        <Navbar
          button='Home'
          url='/'
        />
        <div className='index'>
          {this.state.matchList.message &&
            <p className='error'>{this.state.matchList.message}</p>}

          <div className='blue stats'>
            <p>Solo-FPP – kills: {player['solo-fpp'].kills}</p>
          </div>

          {this.sortAndFilter().map(match => {
            const playDate = new Date(match.createdAt);
            const info = match.info;
            let players, player1End;
            if (typeof info === 'object') {
              players = Object.keys(info).filter(key => info[key].username);
              player1End =
              info.player1.data[info.player1.data.length - 1];
            }

            return (
              <div key={match.id} className='matches'>
                <p>Game Mode: {match.gameMode}</p>
                <p>Map: {match.mapName}</p>
                <p>Server: {match.shardId}</p>
                <p>Duration: {(match.duration / 60).toFixed(2)} minutes</p>
                <p>
                  Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.
                </p>
                {typeof info === 'object' &&
                  <div>
                    <p>
                      Team: {players.map((player, index) =>
                        players.length !== index + 1 ?
                          `${info[player].username}, ` :
                          `${info[player].username}.`)}
                      <br />

                      {player1End.character ?
                        `Ranking: ${this.getOrdinal(player1End.character.ranking)} /
                        ${info.attributes.teams}.` :
                        player1End.victim &&
                        player1End.victim.name === info.player1.username ?
                          `Ranking: ${this.getOrdinal(player1End.victim.ranking)} /
                          ${info.attributes.teams}.` :
                          `Ranking: ${this.getOrdinal(player1End.killer.ranking)} /
                          ${info.attributes.teams}.`}


                      <br />

                      Time played: {(info[players[0]].time/60).toFixed(2)} minutes.
                    </p>
                  </div>}
                <div className='button'>
                  <Link
                    to={{
                      pathname: `/matches/${this.state.username}/${match.id}`,
                      state: {
                        telemetryURL: match.telemetryURL
                      }
                    }}
                    className='button'
                  >
                    Show More
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Index;
