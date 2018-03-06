const mapValues = require('lodash/mapValues')

const Transform = require('./entity-transform')
const { createEntityFactory } = require('./factory')

const definitions = {
  Transform,
  Reducer: Transform,
  Entry: require('./entity-entry'),
  Hash: require('./entity-hash'),
  Model: require('./entity-model'),
  Collection: require('./entity-collection'),
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
