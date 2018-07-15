import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Index extends React.Component{
  state = {};

  componentDidMount(){
    const { username } = this.props.match.params;
    // console.log(this.props);
    axios.get(`https://api.playbattlegrounds.com/shards/pc-eu/players?filter[playerNames]=${username}`, {
      headers: {
        Authorization: `Bearer ${config.PUBG_API_KEY}`,
        Accept: 'application/vnd.api+json'
      }
    })
      .then(res => {
        const telemetry = res.data.data[0].relationships.matches.data;
        this.setState({ telemetry }, () => {
          this.state.telemetry.forEach((match, index) => {
            const matchNumber = `${index+1}`;
            // console.log(matchNumber);
            axios.get(`https://api.playbattlegrounds.com/shards/pc-eu/matches/${match.id}`, {
              headers: {
                Accept: 'application/vnd.api+json'
              }
            })
              .then(res => {
                console.log(res.data, res.data.data.relationships.assets.data[0].id);
                const matches = { ...this.state.matches };
                const id = res.data.data.relationships.assets.data[0].id;
                let telemetryURL;
                // console.log('hi, ',matches);

                res.data.included.forEach((asset) => {
                  if(asset.id === res.data.data.relationships.assets.data[0].id)
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
    if(!this.state.matches) return 'loading...';
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
              pathname: `/matches/${match.id}`,
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
