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
      .then(res => {
        const telemetry = res.data.relationships.matches.data;
        this.setState({ telemetry }, () => {
          this.state.telemetry.forEach((match, index) => {
            const matchNumber = `${index+1}`;
            axios
              .get(`/api/matches/${match.id}`)
              .then(res => {
                console.log(res.data);

                const matches = { ...this.state.matches };
                const id = res.data.data.relationships.assets.data[0].id;
                let telemetryURL;
                // console.log('hi, ',matches);

                res.data.included.forEach((asset) => {
                  if(asset.id === id)
                    telemetryURL = asset.attributes.URL;
                });

                matches[matchNumber] = {
                  id,
                  telemetryURL,
                  attributes: res.data.data.attributes
                };

                const matchesArray = Object.keys(matches).map(key => {
                  return matches[key];
                });

                this.setState({ matches: matchesArray }, () => {
                  // console.log(this.state);
                });
              });
          });
        });
      });
  }

  render(){
    if(!this.state.matches){
      return (
        <div>
          <p>Loading... If this takes a while, the username you typed was incorrect (or bad internet.. or a bug :/).</p>
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
