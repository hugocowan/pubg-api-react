/*global mpld3*/
import React from 'react';
import axios from 'axios';

import Navbar from './Navbar';


import ErrorHandler from './ErrorHandler';


class Show extends React.Component{
  state = {
    map: false,
    button: 'Back',
    url: `/matches/${this.props.match.params.username}`
  };

  _source = axios.CancelToken.source();

  componentDidMount() {

    const { telemetryURL } = this.props.location.state;
    const { username, id } = this.props.match.params;
    axios
      .get(`/api/telemetry/${username}/${id}/${telemetryURL}`, {
        cancelToken: this._source.token
      })
      .then(res => {
        this.setState(res.data, () => {
          console.log(this.state);
          // this.showMap();
        });
      })
      .catch(err => {
        console.log(`Request for match info cancelled, ${err.message || err}`);
      });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.showMap);
    this._source.cancel('Request cancelled by user.');
  }

  getMap = () => {
    axios
      .get(`/api/map/${this.props.match.params.id}`, {
        cancelToken: this._source.token
      })
      .then(res => this.setState({ mapData: res.data }, () =>
        this.showMap()))
      .catch(err => {
        console.log(`Request for mapData cancelled, ${err.message || err}`);
      });
  }

  showMap = () => {
    window.addEventListener('resize', this.showMap);
    const mapDiv = document.getElementById('map');
    while (mapDiv.firstChild) {
      mapDiv.removeChild(mapDiv.firstChild);
    }

    if(this.state.mapData) {
      const mapData = this.state.mapData;
      mapData.width = window.innerWidth;
      mapData.height = window.innerWidth * 70/100;
      mpld3.draw_figure('map', mapData);
      this.setState({ map: true });
    }
  }

  render(){

    return(
      <div>
        <Navbar
          button={this.state.button}
          url={this.state.url}
        />
        <div className='show'>
          {!this.state.info && !this.state.message &&
           <div className='blue show'>Loading... (this could take a while!)</div>}
          {this.state.matchList && this.state.matchList.message &&
          <ErrorHandler
            message = {this.state.matchList.message}
          />}
          {typeof this.state.info === 'object' &&
          !this.state.map &&
          <div className='button'>
            <a onClick={this.getMap}>Show Map</a>
          </div>}
          <div id='map' />
        </div>
      </div>
    );
  }
}

export default Show;
