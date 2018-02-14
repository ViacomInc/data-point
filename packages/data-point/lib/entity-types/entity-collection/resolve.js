const Util = require('util')
const Promise = require('bluebird')
const _ = require('lodash')

const utils = require('../../utils')

/**
 * NOTE: as expensive as this might be, this is to avoid 'surprises'
 * @param {Accumulator} acc
 * @return {Promise<Accumulator>}
 */
function validateAsArray (acc) {
  const entity = acc.reducer.spec
  return acc.value instanceof Array
    ? acc
    : Promise.reject(
        new Error(
          Util.format(
            '%s received value = %s of type %s,',
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
 */
function resolve (accumulator, resolveReducer) {
  const entity = accumulator.reducer.spec

  return resolveReducer(accumulator, entity.value)
    .then(acc => validateAsArray(acc))
    .then(acc => resolveReducer(acc, entity.compose))
}

module.exports.resolve = resolve
