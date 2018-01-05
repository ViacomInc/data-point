const ReducerHelpers = require('./reducer-helpers').resolvers

const ReducerEntity = require('./reducer-entity')
const ReducerFunction = require('./reducer-function')
const ReducerList = require('./reducer-list')
const ReducerObject = require('./reducer-object')
const ReducerPath = require('./reducer-path')

const resolveFunctions = Object.assign({}, ReducerHelpers, {
  [ReducerEntity.type]: ReducerEntity.resolve,
  [ReducerFunction.type]: ReducerFunction.resolve,
  [ReducerList.type]: ReducerList.resolve,
  [ReducerObject.type]: ReducerObject.resolve,
  [ReducerPath.type]: ReducerPath.resolve
})

/**
 * apply a Reducer to an accumulator
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, accumulator, reducer) {
  // this conditional is here because BaseEntity#resolve
  // does not check that lifecycle methods are defined
  // before trying to resolve them
  if (!reducer) {
    return Promise.resolve(accumulator)
  }

  const resolveReducer = resolveFunctions[reducer.type]
  if (!resolveReducer) {
    throw new Error(`Reducer type '${reducer.type}' was not recognized`)
  }

  // NOTE: recursive call
  return resolveReducer(manager, resolve, accumulator, reducer)
}

module.exports.resolve = resolve
