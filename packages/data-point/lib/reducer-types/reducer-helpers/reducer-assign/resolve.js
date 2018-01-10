const utils = require('../../../utils')

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {ReducerAssign} reducerAssign
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducerAssign) {
  const reducer = reducerAssign.reducer
  return resolveReducer(manager, accumulator, reducer).then(acc => {
    const value = Object.assign({}, accumulator.value, acc.value)
    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
