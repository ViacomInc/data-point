const Promise = require('bluebird')

/**
 *
 * @param {Array} caseStatements
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @returns {Promise}
 */
function getMatchingCaseIndex (caseStatements, acc, resolveReducer, stack) {
  return Promise.reduce(
    caseStatements,
    (result, statement, index) => {
      if (result !== null) {
        // doing this until proven wrong :)
        const err = new Error('bypassing')
        err.name = 'bypass'
        err.bypass = true
        err.bypassValue = result
        return Promise.reject(err)
      }

      const _stack = stack ? [...stack, index, ['case']] : stack
      return resolveReducer(acc, statement.case, _stack).then(res => {
        return res.value ? index : null
      })
    },
    null
  ).catch(error => {
    // checking if this is an error to bypass the `then` chain
    if (error.bypass === true) {
      return error.bypassValue
    }

    throw error
  })
}

module.exports.getMatchingCaseIndex = getMatchingCaseIndex

/**
 * @param {Accumulator} acc
 * @param {Function} resolveReducer
 * @param {Array} stack
 * @returns {Promise<Accumulator>}
 */
function resolve (acc, resolveReducer, stack) {
  const selectControl = acc.reducer.spec.select
  const caseStatements = selectControl.cases
  const defaultTransform = selectControl.default

  let _stack = stack ? [...stack, 'select'] : stack
  return getMatchingCaseIndex(caseStatements, acc, resolveReducer, _stack).then(
    index => {
      if (index === null) {
        _stack = stack ? [...stack, 'do', ['default']] : stack
        return resolveReducer(acc, defaultTransform, _stack)
      }

      const caseStatement = caseStatements[index]
      _stack = stack ? [...stack, 'do', index] : stack
      return resolveReducer(acc, caseStatement.do, _stack)
    }
  )
}

module.exports.resolve = resolve
