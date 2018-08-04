import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import Navbar from './Navbar';
import PlayerSeason from './PlayerSeason';
import ErrorHandler from './ErrorHandler';

class Index extends React.Component{
  state = {
    sort: 'createdAt|desc',
    search: '',
    username: this.props.match.params.username,
    gameModeFPP: true,
    selectValue: '',
    selectSeason: ''
  };

  _source = axios.CancelToken.source();

  componentDidMount(){

    const { username } = this.state;

    axios
      .get(`/api/${username}`, {
        cancelToken: this._source.token
      })
      .then(res => this.setState({ matchList: res.data }, () => {
        // console.log('matchList: ',this.state.matchList);

        axios
          .get(`/api/seasons/${username}/${this.state.matchList.id}`, {
            cancelToken: this._source.token
          })
          .then(res => this.setState({ playerSeason: res.data }, () => {
            console.log(this.state);
            const retrievedDates = this.state.playerSeason.map(season =>
              `${season.date}`);

            this.getValue(retrievedDates);

            if (!Object.keys(this.state.matchList).includes('message')) {
              const { matchList } = this.state;
              const matches = [ ...matchList.matches ];


              this.state.matchList.matches.forEach((match, index) => {
                if (!match.info || typeof match.info === 'string') {


                  if(!retrievedDates.includes(match.date)) {
                    console.log('Season date not found!');
                    retrievedDates.push(match.date);
                    this.handleSeasonChange({ target: { date: match.date } });
                  }

                  //Only the first 10 or 20 matches should be retrieved,
                  //the others paginated or behind a never-ending scroll.
                  //It's a lot of data to get if they have 100s of matches.
                  // console.log('username: ', username);

                  axios
                    .get(`/api/telemetry/${username}/${match.id}/${match.telemetryURL}`, {
                      cancelToken: this._source.token
                    })
                    .then(res => {
                      matches[index] = res.data;
                      this.setState({ ...this.state, matchList: { ...matchList, matches } }, () => {
                        // console.log(this.state);
                      });
                    })
                    .catch(err => console.log('Request for match data cancelled.', err.message || err));
                }
              });
            }
          }))
          .catch(err => console.log('Request for average season data cancelled.', err.message || err));
      }))
      .catch(err => console.log('Request for match list cancelled.', err.message || err));
  }

  componentWillUnmount(){
    this._source.cancel('Request cancelled by user.');
  }

  sortAndFilter = () => {
    const [field, dir] = this.state.sort.split('|');
    const re = new RegExp(this.state.search, 'i');
    const filtered = _.filter(this.state.matchList.matches, match => {
      return re.test(match.createdAt) ||
             re.test(match.mapName) ||
             re.test(match.gameMode);
    });
    return _.orderBy(filtered, field, dir).filter(match => match.date === this.state.selectValue);
  }

  getOrdinal = (number) => {
    const suffix = ['th','st','nd','rd'];
    const value = number % 100;
    return number + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  }

  handleChange = () => {
    this.setState({ gameModeFPP: !this.state.gameModeFPP });
  }

  handleSeasonChange = ({ target: { value, date } }) => {

    if(date) {
      // console.log('Getting old season...');
      return axios
        .get(`/api/seasons/${this.state.username}/${this.state.matchList.id}/${date}`, {
          cancelToken: this._source.token
        })
        .then(res => this.setState({ playerSeason: res.data }))
        .catch(err => console.log('Request for older season data cancelled.', err.message || err));
    }

    if(value === 'new') {
      const select = document.getElementById('season');
      const oldestSeason = select.childNodes[select.childElementCount - 2].value.split('-');
      const previousMonth = () => {
        if(`${parseInt(oldestSeason[1]) - 1}`.length === 1)
          return `0${parseInt(oldestSeason[1]) - 1}`;
        return `${parseInt(oldestSeason[1]) - 1}`;
      };
      const date = `${oldestSeason[0]}-${previousMonth()}`;

      return axios
        .get(`/api/seasons/${this.state.username}/${this.state.matchList.id}/${date}`, {
          cancelToken: this._source.token
        })
        .then(res => this.setState({ playerSeason: res.data }, () => {
          const selectSeason = res.data.filter(season => season.date === date)[0];
          this.setState({ selectSeason, selectValue: date }, () => console.log(this.state));
        }))
        .catch(err => console.log('Request for older season data cancelled.', err.message || err));
    }

    return this.setState({ selectValue: value }, () => {
      const selectSeason = this.state.playerSeason.filter(season =>
        season.date === this.state.selectValue)[0];
      this.setState({ selectSeason });
    });
  }

  getValue = (retrievedDates) => {
    const value = retrievedDates.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    if(!this.state.selectValue) {
      this.setState({ selectValue: value }, () => {
        const selectSeason = this.state.playerSeason.filter(season =>
          season.date === this.state.selectValue)[0];
        this.setState({ selectSeason });
      });
    }
  }

  render(){

    if(!this.state.matchList){
      return (
        <div>
          <Navbar
            button='Home'
            url='/'
          />
          <div className='index'>
            <div className='blue'>Loading... Hey. How are you doing. {'I\'m'} alright. If this takes a while, the username you typed may be incorrect.</div>
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
        {this.state.playerSeason &&
          <PlayerSeason
            seasonData = {this.state.playerSeason}
            selectSeason = {this.state.selectSeason}
            selectValue = {this.state.selectValue}
            gameModeFPP = {this.state.gameModeFPP}
            getValue = {this.getValue}
            handleChange = {this.handleChange}
            handleSeasonChange = {this.handleSeasonChange}
          />}

        <div className='index'>
          {this.state.matchList.message &&
            <ErrorHandler
              message = {this.state.matchList.message}
            />}

          {!this.sortAndFilter()[0] && !this.state.matchList.message &&
          <div className='blue'>
            No matches in the database for this season.
          </div>}


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
                <div>
                  <p>Game Mode: {match.gameMode}</p>
                  <p>Map: {match.mapName}</p>
                  <p>Server: {match.shardId}</p>
                  <p>Duration: {(match.duration / 60).toFixed(2)} minutes</p>
                  <p>Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.</p>
                </div>
                {typeof info === 'object' &&
                  <div className='info'>
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
                    </div>

                    {info[players[0]].kills && players.map((player, index) =>
                      <div key={index}>
                        <p>{`${info[player].username}:`}
                          <br />
                          {info[players[index]].kills &&
                          `Kills – ${info[players[index]].kills.length},`}
                          <br />
                          {info[players[index]].avgFPS &&
                            <span>
                              Average FPS – {parseInt(info[players[index]].avgFPS)}
                              <br />
                            </span>}
                        </p>
                        {info[players[index]].death &&
                        <div className='button'>
                          <Link
                            to = {`/matches/${info[players[index]].death.killer.name}`}
                            target='_blank'
                          >
                            Killed by {info[players[index]].death.killer.name}
                          </Link>
                        </div>}
                      </div>)}
                  </div>}

                <div className='button'>
                  <Link
                    to={{
                      pathname: `/matches/${this.state.username}/${match.id}`,
                      state: {
                        telemetryURL: match.telemetryURL
                      }
                    }}
                  >
                    Show Map
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
