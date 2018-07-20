import React from 'react';
import axios from 'axios';

import Navbar from './Navbar';


class Show extends React.Component{
  state = {};

  componentDidMount() {
    const { telemetryURL } = this.props.location.state;
    const { username } = this.props.match.params;
    axios
      .get(`/api/telemetry/${username}/${telemetryURL}`)
      .then(res => {
        console.log(res);
        this.setState(res.data, () => {
          console.log(this.state);
        });
      });
  }

  render(){
    const players = Object.keys(this.state);
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
          WIP. See printed arrays below, or in the console. F12 or CMD+ALT+i.
        </p>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    );
  }
}

export default Show;
