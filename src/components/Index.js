import React from 'react';
import axios from 'axios';
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
      .then(res => this.setState({ season: res.data }, () => console.log(this.state)));
  }

  sortAndFilter = () => {
    const [field, dir] = this.state.sort.split('|');
    console.log('hi!', field, dir);
    const re = new RegExp(this.state.search, 'i');
    const filtered = _.filter(this.state.season.matches, match => {
      return re.test(match.createdAt) ||
             re.test(match.mapName) ||
             re.test(match.gameMode);
    });
    return _.orderBy(filtered, field, dir);
  }

  render(){

    if(!this.state.season){
      return (
        <div>
          <Navbar
            button='Home'
            url='/'
          />
          <div className='index'>
            <div className='button'>
              <Link to='/'>
              Go Back
              </Link>
            </div>
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
          {this.state.season.message &&
            <p className='error'>{this.state.season.message}</p>}
          {this.sortAndFilter().map(match =>{
            const playDate = new Date(match.createdAt);

            return (
              <div key={match.id} className='matches'>
                <p>Game Mode: {match.gameMode}</p>
                <p>Map: {match.mapName}</p>
                <p>Server: {match.shardId}</p>
                <p>Duration: {(match.duration / 60).toFixed(2)} minutes</p>
                <p>Played on: {playDate.toLocaleString()}</p>
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
