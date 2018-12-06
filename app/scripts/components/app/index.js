import React from 'react';
import { connect } from 'react-redux';
import { target, environment } from '../../config';
import { displayCase } from '../../utils/format';
import { getApiVersion } from '../../actions';

import Header from './header';

var App = React.createClass({
  displayName: 'App',

  propTypes: {
    children: React.PropTypes.object,
    dispatch: React.PropTypes.func,
    location: React.PropTypes.object,
    api: React.PropTypes.object
  },

  componentWillMount: () => {
    this.props.dispatch(getApiVersion);
  },

  render: function () {
    return (
      <div className='app'>
        { target !== 'cumulus' ? (
          <div className='app__target--container'>
            <h4 className='app__target'>{displayCase(target)} ({displayCase(environment)})</h4>
            <h5 className='app__api_version'>{`API Version: ${this.state.api_version}`}</h5>
          </div>
        ) : null }
        <Header dispatch={this.props.dispatch} api={this.props.api} location={this.props.location}/>
        <main className='main' role='main'>
          {this.props.children}
        </main>
      </div>
    );
  }
});

export default connect(state => state)(App);
