/*global mpld3, mpld3.draw_figure()*/
import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Navbar from './Navbar';
import PlayerSeason from './PlayerSeason';
import MatchInfo from './MatchInfo';
import ErrorHandler from './ErrorHandler';

class Index extends React.Component{
  state = {
    sort: 'attributes.createdAt|desc',
    search: '',
    username: this.props.match.params.username,
    gameModeFPP: true,
    selectValue: '',
    selectSeason: '',
    map: false
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
            // console.log(this.state);
            const retrievedDates = this.state.playerSeason.map(season =>
              `${season.date}`);

            this.getValue(retrievedDates);

            if (!Object.keys(this.state.matchList).includes('message')) {
              const { matchList } = this.state;
              const matches = [ ...matchList.matches ];


              this.state.matchList.matches.forEach((match, index) => {
                if (!match.info || typeof match.info === 'string') {
                  const attrs = match.attributes;


                  if(!retrievedDates.includes(attrs.date)) {
                    console.log('Season date not found!');
                    retrievedDates.push(attrs.date);
                    this.handleSeasonChange({ target: {
                      date: attrs.date
                    } });
                  }

                  //Only the first 10 or 20 matches should be retrieved,
                  //the others paginated or behind a never-ending scroll.
                  //It's a lot of data to get if they have 100s of matches.
                  // console.log('username: ', username);

                  axios
                    .get(`/api/telemetry/${username}/${attrs.id}/${attrs.telemetryURL}`, {
                      cancelToken: this._source.token
                    })
                    .then(res => {
                      matches[index] = res.data;
                      this.setState({ ...this.state, matchList: { ...matchList, matches } }, () => {
                        if(this.state.matchList.matches.length === index + 1)
                          console.log(this.state);
                      });
                    })
                    .catch(err => console.log('Request for match data cancelled.', err.message || err));
                }
              });
            }
          }))
          .catch(err => console.log('Request for average season data cancelled.',
            err.message || err));
      }))
      .catch(err => console.log('Request for match list cancelled.',
        err.message || err));
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.showMap);
    this._source.cancel('Request cancelled by user.');
  }

  sortAndFilter = () => {
    const [field, dir] = this.state.sort.split('|');
    const re = new RegExp(this.state.search, 'i');
    const filtered = _.filter(this.state.matchList.matches, match => {
      return re.test(match.attributes.createdAt) ||
             re.test(match.attributes.mapName) ||
             re.test(match.attributes.gameMode);
    });
    return _.orderBy(filtered, field, dir).filter(match =>
      match.attributes.date === this.state.selectValue);
  };

  getOrdinal = (number) => {
    const suffix = ['th','st','nd','rd'];
    const value = number % 100;
    return number + (suffix[(value - 20) % 10] || suffix[value] || suffix[0]);
  };

  handleChange = () => {
    this.setState({ gameModeFPP: !this.state.gameModeFPP });
  };

  handleReload = (username) => {
    this.props.history.push(`/matches/${username}`);
    window.location.reload();
  };

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
  };

  getValue = (retrievedDates) => {
    const value = retrievedDates.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
    if(!this.state.selectValue) {
      this.setState({ selectValue: value }, () => {
        const selectSeason = this.state.playerSeason.filter(season =>
          season.date === this.state.selectValue)[0];
        this.setState({ selectSeason });
      });
    }
  };

  getMap = (match) => {
    this.setState({ mapMatch: match }, () => {
      axios
        .get(`/api/map/${match.attributes.id}`, {
          cancelToken: this._source.token
        })
        .then(res => this.setState({ mapData: res.data }, () => {
          // console.log(this.state);
          this.showMap(match);
        }))
        .catch(err => {
          console.log(`Request for mapData cancelled, ${err.message || err}`);
        });

    });

  };

  showMap = (match) => {
    window.addEventListener('resize', this.showMap);

    if(this.state.map) {
      const mapDiv = document.getElementById('map');
      while (mapDiv.firstChild) {
        mapDiv.removeChild(mapDiv.firstChild);
      }
      const mapData = this.state.mapData;
      mapData.width = window.innerWidth;
      mapData.height = window.innerWidth * 70/100;
      return mpld3.draw_figure('map', mapData);
    }


    this.setState({ map: true, mapMatch: match }, () => {
      console.log('here', this.state);
      const mapDiv = document.getElementById('map');
      while (mapDiv.firstChild) {
        mapDiv.removeChild(mapDiv.firstChild);
      }

      if(match.info) {
        const mapData = this.state.mapData;
        mapData.width = window.innerWidth;
        mapData.height = window.innerWidth * 70/100;
        mpld3.draw_figure('map', mapData);
      }
    });
  };

  hideMap = () => {
    window.removeEventListener('resize', this.showMap);
    const mapDiv = document.getElementById('map');
    while (mapDiv.firstChild) {
      mapDiv.removeChild(mapDiv.firstChild);
    }
    this.setState({ map: false, mapMatch: '' });
  };

  render(){

    if(!this.state.matchList) {
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

    if(this.state.map) {
      return (
        <div>
          <Navbar
            button='Back'
            hideMap={this.hideMap}
          />
          <div className='index'>
            <MatchInfo
              match={this.state.mapMatch}
              getOrdinal={this.getOrdinal}
              mapMatch={this.state.mapMatch}
              getMap={this.getMap}
              reload={this.handleReload}
              map={this.state.map}
            />
          </div>
          <div id='map'></div>
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
            seasonData={this.state.playerSeason}
            selectSeason={this.state.selectSeason}
            selectValue={this.state.selectValue}
            gameModeFPP={this.state.gameModeFPP}
            getValue={this.getValue}
            handleChange={this.handleChange}
            handleSeasonChange={this.handleSeasonChange}
          />}

        <div className='index'>
          {this.state.matchList.message &&
            <ErrorHandler
              message={this.state.matchList.message}
            />}

          {!this.sortAndFilter()[0] && !this.state.matchList.message &&
            this.state.playerSeason &&
          <div className='blue'>
            No matches in the database for this season.
          </div>}


          {this.sortAndFilter().map(match => {

            return (
              <div key={match.id} className='match-filter'>
                <MatchInfo
                  match={match}
                  getOrdinal={this.getOrdinal}
                  mapMatch={this.state.mapMatch}
                  getMap={this.getMap}
                  reload={this.handleReload}
                  map={this.state.map}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Index;
