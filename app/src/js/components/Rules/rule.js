'use strict';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { get } from 'object-path';
import {
  displayCase,
  providerLink,
  fullDate,
  lastUpdated,
  enableText,
  disableText,
  rerunText,
  deleteText
} from '../../utils/format';
import {
  getRule,
  deleteRule,
  rerunRule,
  enableRule,
  disableRule
} from '../../actions';
import Loading from '../LoadingIndicator/loading-indicator';
import Metadata from '../Table/Metadata';
import AsyncCommands from '../DropDown/dropdown-async-command';
import ErrorReport from '../Errors/report';

const metaAccessors = [
  ['RuleName', 'name'],
  ['Workflow', 'workflow'],
  ['Provider', 'provider', providerLink],
  ['ProviderPath', 'provider_path'],
  ['RuleType', 'rule.type'],
  // PGC ['Collection', 'collection', d => collectionLink(getCollectionId(d))],
  ['Timestamp', 'timestamp', fullDate]
];

class Rule extends React.Component {
  constructor () {
    super();
    this.load = this.load.bind(this);
    this.delete = this.delete.bind(this);
    this.enable = this.enable.bind(this);
    this.disable = this.disable.bind(this);
    this.rerun = this.rerun.bind(this);
    this.navigateBack = this.navigateBack.bind(this);
    this.reload = this.reload.bind(this);
    this.errors = this.errors.bind(this);
  }

  componentDidMount () {
    this.load(this.props.match.params.ruleName);
  }

  componentDidUpdate (prevProps) {
    if (this.props.match.params.ruleName !== prevProps.match.params.ruleName) {
      this.load(this.props.match.params.ruleName);
    }
  }

  load (ruleName) {
    this.props.dispatch(getRule(ruleName));
  }

  delete () {
    const { ruleName } = this.props.match.params;
    this.props.dispatch(deleteRule(ruleName));
  }

  enable () {
    const { ruleName } = this.props.match.params;
    this.props.dispatch(enableRule(this.props.rules.map[ruleName].data));
  }

  disable () {
    const { ruleName } = this.props.match.params;
    this.props.dispatch(disableRule(this.props.rules.map[ruleName].data));
  }

  rerun () {
    const { ruleName } = this.props.match.params;
    this.props.dispatch(rerunRule(this.props.rules.map[ruleName].data));
  }

  navigateBack () {
    this.props.history.push('/rules');
  }

  reload () {
    const { ruleName } = this.props.match.params;
    this.load(ruleName);
  }

  errors () {
    const { ruleName } = this.props.match.params;
    const { rules } = this.props;
    return [
      get(rules.map, [ruleName, 'error']),
      get(rules.deleted, [ruleName, 'error']),
      get(rules.enabled, [ruleName, 'error']),
      get(rules.disabled, [ruleName, 'error'])
    ].filter(Boolean);
  }

  render () {
    const { match: { params: { ruleName } }, rules } = this.props;
    const record = rules.map[ruleName];

    if (!record || (record.inflight && !record.data)) {
      return <Loading />;
    }
    const data = get(record, 'data', {});

    const deleteStatus = get(rules, `deleted.${ruleName}.status`);
    const enabledStatus = get(rules, `enabled.${ruleName}.status`);
    const disabledStatus = get(rules, `disabled.${ruleName}.status`);
    const rerunStatus = get(rules, `rerun.${ruleName}.status`);
    const dropdownConfig = [{
      text: 'Enable',
      action: this.enable,
      disabled: data.type === 'onetime',
      status: enabledStatus,
      confirmAction: true,
      confirmText: enableText(ruleName),
      success: this.reload
    }, {
      text: 'Disable',
      action: this.disable,
      disabled: data.type === 'onetime',
      status: disabledStatus,
      confirmAction: true,
      confirmText: disableText(ruleName),
      success: this.reload
    }, {
      text: 'Delete',
      action: this.delete,
      status: deleteStatus,
      success: this.navigateBack,
      confirmAction: true,
      confirmText: deleteText(ruleName)
    }, {
      text: 'Rerun',
      action: this.rerun,
      status: rerunStatus,
      success: this.reload,
      confirmAction: true,
      confirmText: rerunText(ruleName)
    }];

    const errors = this.errors();
    return (
      <div className='page__component'>
        <section className='page__section page__section__header-wrapper'>
          <div className='page__section__header'>
            <h1 className='heading--large heading--shared-content with-description'>{ruleName}</h1>
            <AsyncCommands config={dropdownConfig} />

            <Link
              className='button button--copy button--small button--green form-group__element--right'
              to={{
                pathname: '/rules/add',
                state: {
                  name: ruleName
                }
              }}>Copy</Link>
            <Link
              className='button button--edit button--small button--green form-group__element--right'
              to={`/rules/edit/${ruleName}`}>Edit</Link>
            {lastUpdated(data.timestamp)}
            {data.state ? (
              <dl className='status--process'>
                <dt>State:</dt>
                <dd className={data.state.toLowerCase()}>{displayCase(data.state)}</dd>
              </dl>
            ) : null}

          </div>
        </section>
        <section className='page__section'>
          {errors.length ? <ErrorReport report={errors} /> : null}
          <div className='heading__wrapper--border'>
            <h2 className='heading--medium with-description'>Rule Overview</h2>
          </div>
          <Metadata data={data} accessors={metaAccessors} />
        </section>
      </div>
    );
  }
}

Rule.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  dispatch: PropTypes.func,
  rules: PropTypes.object
};

export default withRouter(connect(state => ({
  rules: state.rules
}))(Rule));
