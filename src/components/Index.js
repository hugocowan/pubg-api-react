import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Index extends React.Component{
  state = {
    username: this.props.match.params.username
  };

  componentDidMount(){
    axios
      .get(`/api/${this.state.username}`)
      .then(res => this.setState({ matches: res.data }));
  }

  render(){
    if(!this.state.matches){
      return (
        <div>
          <p>Loading... If this takes a while, the username you typed may be incorrect.</p>
          <Link to='/'>Try Again</Link>
        </div>
      );
    }
    return(
      <div>
        <Link to='/'>Home</Link>
        <br />
        {this.state.matches.map(match =>
          <div key={match.id}>
            <p>Game Mode: {match.attributes.gameMode}</p>
            <p>Telemetry URL: {match.telemetryURL}</p>
            <p>Map: {match.attributes.mapName}</p>
            <p>Server: {match.attributes.shardId}</p>
            <p>Duration: {match.attributes.duration / 60} minutes.</p>
            <Link to={{
              pathname: `/matches/${this.state.username}/${match.id}`,
              state: {
                telemetryURL: match.telemetryURL
              }
            }}>
              Show More
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default Index;
