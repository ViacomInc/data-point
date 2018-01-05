const createStub = require('./reducer-stub').create

const reducerAssign = require('./reducer-assign')
const reducerFilter = require('./reducer-filter')
const reducerFind = require('./reducer-find')
const reducerMap = require('./reducer-map')
const reducerOmit = require('./reducer-omit')
const reducerPick = require('./reducer-pick')

module.exports.isType = require('./reducer-stub').isType

const factories = {
  [reducerAssign.type]: reducerAssign.create,
  [reducerFilter.type]: reducerFilter.create,
  [reducerFind.type]: reducerFind.create,
  [reducerMap.type]: reducerMap.create,
  [reducerOmit.type]: reducerOmit.create,
  [reducerPick.type]: reducerPick.create
}

module.exports.factories = factories

const resolvers = {
  [reducerAssign.type]: reducerAssign.resolve,
  [reducerFilter.type]: reducerFilter.resolve,
  [reducerFind.type]: reducerFind.resolve,
  [reducerMap.type]: reducerMap.resolve,
  [reducerOmit.type]: reducerOmit.resolve,
  [reducerPick.type]: reducerPick.resolve
}

module.exports.resolvers = resolvers

function bindStubFunction (reducerType) {
  return createStub.bind(null, reducerType)
}

const stubFactories = {
  assign: bindStubFunction(reducerAssign.type),
  filter: bindStubFunction(reducerFilter.type),
  find: bindStubFunction(reducerFind.type),
  map: bindStubFunction(reducerMap.type),
  omit: bindStubFunction(reducerOmit.type),
  pick: bindStubFunction(reducerPick.type)
}

module.exports.stubFactories = stubFactories

/**
 * @param {Function} createReducer
 * @param {ReducerStub} stub
 * @returns {reducer}
 */
function createFromStub (createReducer, stub) {
  const args = [createReducer].concat(stub.args)
  return factories[stub.type].apply(null, args)
}

module.exports.create = createFromStub
