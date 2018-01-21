const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerAssign} reducerAssign
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerAssign, stack) {
  // TODO push to stack here (every reducer needs a totally unique array)
  const reducer = reducerAssign.reducer
  return resolveReducer(manager, accumulator, reducer, stack).then(acc => {
    const value = Object.assign({}, accumulator.value, acc.value)
    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
