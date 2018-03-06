const mapValues = require('lodash/mapValues')

const { createEntityFactory } = require('./factory')

const definitions = {
  Entry: require('./entity-entry'),
  Model: require('./entity-model'),
  Reducer: require('./entity-transform'),
  Collection: require('./entity-collection'),
  Hash: require('./entity-hash'),
  Request: require('./entity-request'),
  Control: require('./entity-control'),
  Schema: require('./entity-schema')
}

module.exports = {
  definitions,
  factories: mapValues(definitions, (value, key) => {
    return createEntityFactory(key.toLowerCase())
  })
}
