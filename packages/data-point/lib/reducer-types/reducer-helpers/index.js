const createStub = require('./reducer-stub').create

const reducerAssign = require('./reducer-assign')
const reducerFilter = require('./reducer-filter')
const reducerFind = require('./reducer-find')
const reducerMap = require('./reducer-map')
const reducerOmit = require('./reducer-omit')
const reducerPick = require('./reducer-pick')

module.exports.isType = require('./reducer-stub').isType

const reducers = {
  [reducerAssign.type]: reducerAssign,
  [reducerFilter.type]: reducerFilter,
  [reducerFind.type]: reducerFind,
  [reducerMap.type]: reducerMap,
  [reducerOmit.type]: reducerOmit,
  [reducerPick.type]: reducerPick
}

module.exports.reducers = reducers

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
  return reducers[stub.type].create.apply(null, args)
}

module.exports.create = createFromStub
