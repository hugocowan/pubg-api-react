import React from 'react';
// import { Link } from 'react-router-dom';

class Home extends React.Component {

  state = {};

  storeName = ({ target: { value } }) => {
    this.setState({username: value});
  }

  redirect = (e) => {
    e.preventDefault();
    this.props.history.push(`/matches/${this.state.username}`);
  }

  render(){
    return(
      <div>
        <p>Welcome to my stats site for PUBG! See all your current season matches here,
          {' '}along with information on how the games went.
        </p>
        <form onSubmit={this.redirect}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            placeholder='Enter username here'
            onChange = {(e) => this.storeName(e)}
          />
          <button
            to={`/matches/${this.state.username}`}
          >
            Click to view your matches
          </button>
        </form>
      </div>
    );
  }
}

export default Home;
