import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Show extends React.Component{
  state = {};

  componentDidMount() {
    const { telemetryURL } = this.props.location.state;
    axios
      .get(`/api/telemetry/${telemetryURL}`)
      .then(res => {
        console.log(res);
        this.setState({ viewedMatch: res.data }, () => {
          console.log(this.state);
        });
      });
  }

  render(){
    if(!this.state.viewedMatch) return 'Loading... (this could take a while!)';
    return(
      <div>
        <Link to='/matches'>Go Back</Link>
        <pre>{JSON.stringify(this.state.viewedMatch, null, 2)}</pre>
      </div>
    );
  }
}

export default Show;
