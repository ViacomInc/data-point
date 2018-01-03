const partial = require('lodash/partial')
const resolveReducerEntity = require('../reducer-entity').resolve
const resolveReducerFunction = require('../reducer-function').resolve
const resolveReducerList = require('../reducer-list').resolve
const resolveReducerObject = require('../reducer-object').resolve
const resolveReducerPath = require('../reducer-path').resolve

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
    case 'ReducerList':
      // NOTE: recursive call
      resolver = partial(resolveReducerList, manager, resolveTransform)
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
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, accumulator, reducer) {
  // NOTE: recursive call
  const reducerFunction = getReducerFunction(manager, resolve, reducer.type)
  const result = reducerFunction(accumulator, reducer)
  return result
}

module.exports.resolve = resolve
