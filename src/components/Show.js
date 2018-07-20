import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
        this.setState({ viewedMatch: res.data }, () => {
          console.log(this.state);
        });
      });
  }

  render(){
    if(!this.state.viewedMatch) return 'Loading... (this could take a while!)';
    return(
      <div>
        <Navbar />
        <Link to='/matches'>Go Back</Link>
        <pre>{JSON.stringify(this.state.viewedMatch, null, 2)}</pre>
      </div>
    );
  }
}

export default Show;
