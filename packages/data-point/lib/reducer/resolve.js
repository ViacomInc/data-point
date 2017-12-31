const partial = require('lodash/partial')
const resolveReducerPath = require('../reducer-path').resolve
const resolveReducerFunction = require('../reducer-function').resolve
const resolveReducerObject = require('../reducer-object').resolve
const resolveReducerEntity = require('../reducer-entity').resolve

/**
 * @param {Object} manager
 * @param {Function} resolveTransform
 * @param {string} reducerType
 * @returns
 */
function getReducerFunction (manager, resolveTransform, reducerType) {
  let resolver

  /* eslint indent: ["error", 2, { "SwitchCase": 1 }] */
  switch (reducerType) {
    case 'ReducerPath':
      resolver = resolveReducerPath
      break
    case 'ReducerFunction':
      resolver = resolveReducerFunction
      break
    case 'ReducerObject':
      // NOTE: recursive call
      resolver = partial(resolveReducerObject, manager, resolveTransform)
      break
    case 'ReducerEntity':
      // NOTE: recursive call
      resolver = partial(resolveReducerEntity, manager, resolveTransform)
      break
    default:
      throw new Error(`Reducer type '${reducerType}' was not recognized`)
  }

  return resolver
}

module.exports.getReducerFunction = getReducerFunction

/**
 * apply a Reducer to an accumulator
 * @param {Object} manager
 * @param {Function} resolveTransform
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveTransform, accumulator, reducer) {
  const reducerFunction = getReducerFunction(
    manager,
    resolveTransform,
    reducer.type
  )
  const result = reducerFunction(accumulator, reducer)
  return result
}

module.exports.resolve = resolve
