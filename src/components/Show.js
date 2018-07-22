import React from 'react';
import axios from 'axios';
import moment from 'moment';

import Navbar from './Navbar';

class Show extends React.Component{
  state = {};

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

    const players = Object.keys(this.state).filter(key => key !== 'info');
    const playDate = new Date(this.state.info.date);

    return(
      <div>
        <Navbar
          button='Back'
          url={`/matches/${this.props.match.params.username}`}
        />
        <div className='show'>
          <p>
            Team: {players.map((player, index) =>
              players.length !== index+1 ? `${player}, ` : `${player}.`)}
            <br />

            Ranking:{' '}
            {this.getOrdinal(this.state[players[0]]
              .data[this.state[players[0]].data.length-1]
              .character.ranking)} / {this.state.info.teams}.


            <br />

            Time played: {(this.state[players[0]].time/60).toFixed(2)} minutes.
            <br />

            Played {moment(playDate).fromNow()}, on {playDate.toLocaleString()}.


          </p>

          {this.state[players[0]].avgFPS && players.map((player, index) =>
            <p key={index}>
              {`${players[index]}:`}
              <br />
              {this.state[players[index]].kills &&
                `Kills – ${this.state[players[index]].kills.length},`}
              <br />
              {`Average FPS - ${parseInt(this.state[players[index]].avgFPS)},`}
              <br />
              {this.state[players[index]].death.killer &&
                `Killed by ${this.state[players[index]].death.killer.name}.`}
            </p>)}
          <p>WIP. See printed arrays below, or in the console. F12 or CMD+ALT+i.</p>
          <pre>{JSON.stringify(this.state, null, 2)}</pre>
        </div>
      </div>
    );
  }
}

export default Show;
