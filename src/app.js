import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import './assets/scss/style.scss';

import Home from './components/Home';
import Index from './components/Index';
import Show from './components/Show';

class App extends React.Component{
  render(){
    return(
      <Router>
        <Switch>
          <Route path='/matches/:username/:id' component={Show}/>
          <Route path='/matches/:username' component={Index}/>
          <Route path='/' component={Home}/>
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
