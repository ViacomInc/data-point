/* eslint-disable global-require */
const mapValues = require("lodash/mapValues");

const { createEntityFactory } = require("./factory");

const definitions = {
  Entry: require("./entity-entry"),
  Model: require("./entity-model"),
  Reducer: require("./entity-transform"),
  Collection: require("./entity-collection"),
  Hash: require("./entity-hash"),
  Request: require("./entity-request"),
  Control: require("./entity-control"),
  Schema: require("./entity-schema")
};

module.exports = {
  definitions,
  // this creates a factory for each entity type, which
  // will be exposed through DataPoint.entityHelpers
  factories: mapValues(definitions, (value, key) => {
    return createEntityFactory(key.toLowerCase());
  })
};
