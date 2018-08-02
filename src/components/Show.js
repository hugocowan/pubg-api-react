/*global mpld3*/
import React from 'react';
import axios from 'axios';

import Navbar from './Navbar';

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

class Show extends React.Component{
  state = {
    map: false,
    button: 'Back',
    url: `/matches/${this.props.match.params.username}`
  };

  componentDidMount() {
    window.addEventListener('resize', this.showMap);

    // console.log('hi there!');

    const { telemetryURL } = this.props.location.state;
    // console.log(telemetryURL);
    const { username, id } = this.props.match.params;
    axios
      .get(`/api/telemetry/${username}/${id}/${telemetryURL}`, {
        cancelToken: source.token
      })
      .then(res => {
        this.setState(res.data, () => {
          console.log(this.state);
          this.showMap();
        });
      })
      .catch(err => console.log('Request for mapData cancelled.', err.message || err));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.showMap);
    source.cancel('Request cancelled by user.');
  }

  showMap = () => {
    const mapDiv = document.getElementById('map');
    while (mapDiv.firstChild) {
      mapDiv.removeChild(mapDiv.firstChild);
    }

    const mapData = this.state.info.player1.mapData;
    mapData.width = window.innerWidth;
    mapData.height = window.innerWidth * 70/100;
    mpld3.draw_figure('map', mapData);
    this.setState({ map: true });
  }

  render(){

    return(
      <div>
        <Navbar
          button={this.state.button}
          url={this.state.url}
        />
        {!this.state.info && !this.state.message &&
         <p>Loading... (this could take a while!)</p>}
        {this.state.message &&
        <p className='error'>{this.state.message}</p>}
        <div id='map' />
      </div>
    );
  }
}

export default Show;
