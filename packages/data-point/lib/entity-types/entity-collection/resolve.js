const Util = require('util')
const Promise = require('bluebird')
const _ = require('lodash')

const utils = require('../../utils')
const { stackPush } = require('../../reducer-stack')

/**
 * @param {Accumulator} accumulator
 * @param {reducer} composeReducer
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @return {Promise<Accumulator>}
 */
function resolveCompose (accumulator, composeReducer, resolveReducer, stack) {
  if (utils.reducerIsEmpty(composeReducer)) {
    return Promise.resolve(accumulator)
  }

  const _stack = stack ? stackPush(stack, 'compose') : stack
  return resolveReducer(accumulator, composeReducer, _stack)
}

// NOTE: as expensive as this might be, this is to avoid 'surprises'
function validateAsArray (acc) {
  const entity = acc.reducer.spec
  return acc.value instanceof Array
    ? acc
    : Promise.reject(
        new Error(
          Util.format(
            '%s received acc.value = %s of type %s,',
            entity.id,
            _.truncate(Util.inspect(acc.value, { breakLength: Infinity }), {
              length: 30
            }),
            utils.typeOf(acc.value),
            'this entity only resolves Array values. More info https://github.com/ViacomInc/data-point/tree/master/packages/data-point#collection-entity'
          )
        )
      )
}

/**
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (accumulator, resolveReducer, stack) {
  const entity = accumulator.reducer.spec

  return resolveReducer(accumulator, entity.value, stack)
    .then(acc => validateAsArray(acc))
    .then(acc => resolveCompose(acc, entity.compose, resolveReducer, stack))
}

module.exports.resolve = resolve
