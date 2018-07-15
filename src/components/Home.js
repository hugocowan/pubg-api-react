import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return(
    <div>
      <p>Welcome to my stats site for PUBG! See all your current season matches here,
      {' '}along with information on how the games went.
      </p>
      <Link to='/matches'>Click here to view matches (while I {'don\'t'} have a navbar :/)</Link>
    </div>
  );
};

export default Home;
