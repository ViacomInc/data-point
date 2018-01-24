const createStub = require('./reducer-stub').create

const reducerAssign = require('./reducer-assign')
const reducerAsArray = require('./reducer-as-array')
const reducerFilter = require('./reducer-filter')
const reducerFind = require('./reducer-find')
const reducerMap = require('./reducer-map')
const reducerOmit = require('./reducer-omit')
const reducerPick = require('./reducer-pick')

/*
"Reducer helpers" are functions that create reducers.

They generate a ReducerStub, which is a temporary
object that is later used to generate a reducer:

// first, the user creates a ReducerStub

const reducer = ReducerStub('filter', '$a.b')

// then, when the stub is passed to transform,
// it will be used to generate a reducer object

dp.transform(reducer, data)

The helpers exposed on DataPoint are the ReducerStub
function bound to a string identifier using bindStubFunction
*/

module.exports.isType = require('./reducer-stub').isType

const reducers = {
  [reducerAssign.type]: reducerAssign,
  [reducerAsArray.type]: reducerAsArray,
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
  [reducerAsArray.name]: bindStubFunction(reducerAsArray.type),
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
