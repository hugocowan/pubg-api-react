import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ button, url, hideMap }) => {
  return(
    <nav>
      <div className='nav-content'>
        {button && <div className="button">
          {url && <Link to={url}>
            {button}
          </Link>}

          {hideMap &&
            <a onClick={() => hideMap()}>
              {button}
            </a>}

        </div>}
        <div className="title">
          <h1>PUBGistics</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
