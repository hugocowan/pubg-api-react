import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

class App extends React.Component{

  state = {
    message: 'Nothing yet.'
  };

  componentDidMount(){
    axios.get('https://api.playbattlegrounds.com/shards/pc-eu/players?filter[playerNames]=boogaliwoogali', {
      headers: {
        Authorization: `Bearer ${config.PUBG_API_KEY}`,
        Accept: 'application/vnd.api+json'
      }
    })
      .then(res => {
        const telemetry = res.data.data[0].relationships.matches.data;
        this.setState({telemetry, message: 'Request Sent.'}, () => {
          this.state.telemetry.forEach((match, index) => {
            const matchNumber = `${index+1}`;
            axios.get(`https://api.playbattlegrounds.com/shards/pc-eu/matches/${match.id}`, {
              headers: {
                Accept: 'application/vnd.api+json'
              }
            })
              .then(res => {
                console.log(res.data, res.data.data.relationships.assets.data[0].id);
                const id = res.data.data.relationships.assets.data[0].id;
                this.setState({
                  matches: {
                    [matchNumber]: {
                      assetId: id
                    }
                  }
                });
              });
          });
        });

      });
  }

  render(){
    if(!this.state.telemetry) return this.state.message;
    // telemetry
    return(
      <div>
        {this.state.telemetry.map(match =>
          <div key={match.id}>
            <p>Match ID: {match.id}</p>
          </div>
        )}
      </div>
    );
  }
}
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
