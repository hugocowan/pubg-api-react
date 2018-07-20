import React from 'react';

import Navbar from './Navbar';

class Home extends React.Component {

  state = {};

  storeName = ({ target: { value } }) => {
    this.setState({ username: value });
  }

  redirect = (e) => {
    e.preventDefault();
    this.props.history.push(`/matches/${this.state.username}`);
  }

  render(){
    return(
      <div className='home'>
        <Navbar/>
        <div className='content'>
          <p>
            Welcome to PUBGistics!
            <br />
            See all your current season matches here,
            {' '}along with information on how the games went. Eventually.
          </p>
          <form onSubmit={this.redirect}>
            <label htmlFor="username">Username: </label>
            <input
              id="username"
              name="username"
              placeholder='Enter username here'
              onChange = {(e) => this.storeName(e)}
              onBlur = {(e) => this.storeName(e)}
            />
            <div className='button'>
              <button
                to={`/matches/${this.state.username}`}
              >
                View your matches
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default Home;
