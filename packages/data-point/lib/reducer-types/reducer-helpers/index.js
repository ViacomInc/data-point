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
  [reducerAssign.name]: bindStubFunction(reducerAssign.type),
  [reducerFilter.name]: bindStubFunction(reducerFilter.type),
  [reducerFind.name]: bindStubFunction(reducerFind.type),
  [reducerMap.name]: bindStubFunction(reducerMap.type),
  [reducerOmit.name]: bindStubFunction(reducerOmit.type),
  [reducerPick.name]: bindStubFunction(reducerPick.type)
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
