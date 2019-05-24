'use strict';
import assignDate from './assign-date';

import {
  DIST,
  DIST_INFLIGHT,
  DIST_ERROR
} from '../actions/types';

const initialState = {
  dist: {
    data: {
      errors: {},
      successes: {}
    }
  }
}

export default function reducer (state = initialState, action) {
  let nextState, dist;
  switch (action.type) {
    case DIST:
      dist = { data: assignDate(action.data), inflight: false, error: null };
      nextState = Object.assign(state, { dist });
      break;
    case DIST_INFLIGHT:
      dist = { data: state.dist.data, inflight: true, error: state.dist.error };
      nextState = Object.assign(state, { dist });
      break;
    case DIST_ERROR:
      dist = { data: state.dist.data, inflight: false, error: action.error };
      nextState = Object.assign(state, { dist });
      break;
  }

  return nextState || state;
}
