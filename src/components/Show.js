/*global mpld3*/

import React from 'react';
import axios from 'axios';
import moment from 'moment';

import Navbar from './Navbar';

class Show extends React.Component{
  state = {
    map: false,
    button: 'Back',
    url: `/matches/${this.props.match.params.username}`
  };

  componentDidMount() {
    const { telemetryURL } = this.props.location.state;
    console.log(telemetryURL);
    const { username, id } = this.props.match.params;
    axios
      .get(`/api/telemetry/${username}/${id}/${telemetryURL}`)
      .then(res => {
        this.setState(res.data, () => {
          console.log(this.state);
          this.showMap();
        });
      });
  }

  getOrdinal = (number) => {
    var suffix=['th','st','nd','rd'],
      value=number%100;
    return number+(suffix[(value-20)%10]||suffix[value]||suffix[0]);
  }

  showMap = () => {
    const mapData = this.state.info.player1.mapData;
    mapData.width = window.innerWidth;
    mapData.height = window.innerWidth * 70/100;
    mpld3.draw_figure('map', mapData);
    this.setState({ map: true });
  }

  render(){

    const info = this.state.info;
    let players, playDate, player1End;

    if(info) {
      players = Object.keys(info).filter(key => info[key].username);
      playDate = new Date(info.attributes.date);
      player1End =
      info.player1.data[info.player1.data.length - 1];
    }

    return(
      <div>
        <Navbar
          button={this.state.button}
          url={this.state.url}
        />

        {!info && !this.state.message &&
           <p>Loading... (this could take a while!)</p>}

        {this.state.message &&
          <p className='error'>{this.state.message}</p>}

        {info && <div className='show'>
          <p>
            Team: {players.map((player, index) =>
              players.length !== index+1 ? `${info[player].username}, ` :
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
            <br />

            Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.


          </p>

          {info[players[0]].kills && players.map((player, index) =>
            <div key={index} className='blue'>
              {`${info[player].username}:`}
              <br />
              {info[players[index]].kills &&
                `Kills – ${info[players[index]].kills.length},`}
              <br />
              {info[players[index]].avgFPS &&
                <div>
                Average FPS – {parseInt(info[players[index]].avgFPS)},
                  <br />
                </div>}
              {info[players[index]].death &&
                `Killed by ${info[players[index]].death.killer.name}.`}
            </div>)}
          <div id='map' onLoad={(e)=> this.showMap(e)} />
          {/* <pre>{JSON.stringify(this.state, null, 2)}</pre> */}

        </div>}
      </div>
    );
  }
}

export default Show;
