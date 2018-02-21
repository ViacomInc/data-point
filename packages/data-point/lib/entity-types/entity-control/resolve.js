const Promise = require('bluebird')

/**
 *
 * @param {Array<Object>} caseStatements
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @return {Number}
 */
function getMatchingCaseIndex (caseStatements, accumulator, resolveReducer) {
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

      return resolveReducer(accumulator, statement.case, ['case', index]).then(
        res => {
          return res.value ? index : null
        }
      )
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
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @returns {Promise}
 */
function resolve (accumulator, resolveReducer) {
  const selectControl = accumulator.reducer.spec.select
  const caseStatements = selectControl.cases
  const defaultTransform = selectControl.default

  return getMatchingCaseIndex(caseStatements, accumulator, resolveReducer).then(
    index => {
      if (index === null) {
        // const _index = caseStatements.length
        return resolveReducer(accumulator, defaultTransform, ['do', ['default']])
      }

      const caseStatement = caseStatements[index]
      return resolveReducer(accumulator, caseStatement.do, ['do', index])
    }
  )
}

module.exports.resolve = resolve
