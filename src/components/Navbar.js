import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({button, url}) => {
  return(
    <nav>
      <div className='nav-content'>
        {button && <div className="button">
          <Link to={url}>
            {button}
          </Link>
        </div>}
        <div className="title">
          <h1>PUBGistics</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
