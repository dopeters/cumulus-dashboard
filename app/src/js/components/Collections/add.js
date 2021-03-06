'use strict';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { createCollection, getSchema } from '../../actions';
import { getCollectionId, collectionHref } from '../../utils/format';
import { removeReadOnly } from '../FormSchema/schema';
import AddRaw from '../AddRaw/add-raw';

const AddCollection = ({ location = {}, collections, dispatch, schema }) => {
  const [defaultValue, setDefaultValue] = useState({});
  const { state: locationState } = location;
  const { name, version } = locationState || {};
  const collectionId = getCollectionId({ name, version });
  const { collection: collectionSchema } = schema || {};
  const { map: collectionsMap } = collections || {};
  const isCopy = !!(name && version);

  useEffect(() => {
    if (isCopy) {
      dispatch(getSchema('collection'));
    }
  }, [isCopy, dispatch]);

  useEffect(() => {
    const record = collectionsMap[collectionId];
    const { data } = record || {};
    if (isCopy && data && collectionSchema) {
      setDefaultValue(removeReadOnly(data, collectionSchema));
    }
  }, [collectionSchema, collectionId, collectionsMap, isCopy]);

  const getBaseRoute = (pk = collectionId) => {
    return (pk && pk !== 'unknown') ? collectionHref(pk) : '/collections';
  };

  return (
    <AddRaw
      pk={'new-collection'}
      title={'Add a collection'}
      primaryProperty={'name'}
      state={collections}
      createRecord={createCollection}
      getBaseRoute={getBaseRoute}
      getPk={getCollectionId}
      defaultValue={defaultValue}
    />
  );
};

AddCollection.propTypes = {
  location: PropTypes.object,
  collections: PropTypes.object,
  dispatch: PropTypes.func,
  schema: PropTypes.object,
};

export default withRouter(connect(state => ({
  collections: state.collections,
  schema: state.schema
}))(AddCollection));
