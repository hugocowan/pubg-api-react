/*global mpld3*/

import React from 'react';
import axios from 'axios';
import moment from 'moment';

import Navbar from './Navbar';

class Show extends React.Component{
  state = {
    map: false
  };

  componentDidMount() {
    const { telemetryURL } = this.props.location.state;
    console.log(telemetryURL);
    const { username, id } = this.props.match.params;
    axios
      .get(`/api/telemetry/${username}/${id}/${telemetryURL}`)
      .then(res => {
        const matchData = res.data;
        delete matchData.__v;
        delete matchData._id;
        delete matchData.id;

        this.setState(res.data, () => {
          console.log(this.state);
        });
      });
  }

  getOrdinal = (number) => {
    var suffix=['th','st','nd','rd'],
      value=number%100;
    return number+(suffix[(value-20)%10]||suffix[value]||suffix[0]);
  }

  showMap = (e) => {
    e.preventDefault();
    mpld3.draw_figure('image', this.state.player1.mapData);
    this.setState({ map: true });
  }

  render(){

    if(!this.state.info) return (
      <div>
        <Navbar
          button='Back'
          url={`/matches/${this.props.match.params.username}`}
        />
        <p>Loading... (this could take a while!)</p>
      </div>
    );

    const players = Object.keys(this.state).filter(key => key !== 'info' && key !== 'map');
    const playDate = new Date(this.state.info.date);
    const player1End =
    this.state.player1.data[this.state.player1.data.length - 1];

    return(
      <div>
        <Navbar
          button='Back'
          url={`/matches/${this.props.match.params.username}`}
        />
        <div className='show'>
          <p>
            Team: {players.map((player, index) =>
              players.length !== index+1 ? `${this.state[player].username}, ` : `${this.state[player].username}.`)}
            <br />

            {player1End.character ? `Ranking:
            ${this.getOrdinal(player1End.character.ranking)}
            / ${this.state.info.teams}.` :
              player1End.victim &&
              player1End.victim.name === this.state.player1.username ? `Ranking:
            ${this.getOrdinal(player1End.victim.ranking)}
            / ${this.state.info.teams}.` : `Ranking:
          ${this.getOrdinal(player1End.killer.ranking)}
          / ${this.state.info.teams}.`}


            <br />

            Time played: {(this.state[players[0]].time/60).toFixed(2)} minutes.
            <br />

            Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.


          </p>

          {this.state[players[0]].kills && players.map((player, index) =>
            <div key={index} className='blue'>
              {`${this.state[player].username}:`}
              <br />
              {this.state[players[index]].kills &&
                `Kills – ${this.state[players[index]].kills.length},`}
              <br />
              {this.state[players[index]].avgFPS &&
                <div>
                Average FPS – {parseInt(this.state[players[index]].avgFPS)},
                  <br />
                </div>}
              {this.state[players[index]].death &&
                `Killed by ${this.state[players[index]].death.killer.name}.`}
            </div>)}
          <p>WIP. See printed arrays below, or in the console. F12 or CMD+ALT+i.</p>
          {!this.state.map && <div className='button'>
            <button onClick={(e)=> this.showMap(e)}>Show map</button>
          </div>}
          <div id='image' onLoad={(e)=> this.showMap(e)} />
          <pre>{JSON.stringify(this.state, null, 2)}</pre>

        </div>
      </div>
    );
  }
}

export default Show;
