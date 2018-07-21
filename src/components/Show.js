import React from 'react';
import axios from 'axios';

import Navbar from './Navbar';


class Show extends React.Component{
  state = {};

  componentDidMount() {
    const { telemetryURL } = this.props.location.state;
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

  render(){
    const players =
      Object.keys(this.state).filter(key => key !== 'info');
    if(!players[0]) return (
      <div>
        <Navbar
          button='Back'
          url={`/matches/${this.props.match.params.username}`}
        />
        <p>Loading... (this could take a while!)</p>
      </div>
    );
    return(
      <div>
        <Navbar
          button='Back'
          url={`/matches/${this.props.match.params.username}`}
        />
        <p>
          Team: {players.map((player, index) =>
            players.length !== index+1 ? `${player}, ` : `${player}.`)}
          <br />

          Ranking: {this.state[players[0]].data[this.state[players[0]].data.length-1].character.ranking}
        </p>
        <p>WIP. See printed arrays below, or in the console. F12 or CMD+ALT+i.</p>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    );
  }
}

export default Show;
