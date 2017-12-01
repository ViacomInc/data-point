'use strict'

const Promise = require('bluebird')

/**
 *
 * @param {any} caseStatements
 * @param {any} acc
 * @param {any} resolveTransform
 * @returns
 */
function getMatchingCaseStatement (caseStatements, acc, resolveTransform) {
  return Promise.reduce(
    caseStatements,
    (result, statement) => {
      if (result) {
        // doing this until proven wrong :)
        const err = new Error('bypassing')
        err.name = 'bypass'
        err.bypass = true
        err.bypassValue = result
        return Promise.reject(err)
      }

      return resolveTransform(acc, statement.case).then(res => {
        return res.value ? statement : false
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
module.exports.getMatchingCaseStatement = getMatchingCaseStatement

function resolve (acc, resolveTransform) {
  const selectControl = acc.reducer.spec.select
  const caseStatements = selectControl.cases
  const defaultTransfrom = selectControl.default

  return getMatchingCaseStatement(caseStatements, acc, resolveTransform).then(
    caseStatement => {
      if (caseStatement) {
        return resolveTransform(acc, caseStatement.do)
      }

      return resolveTransform(acc, defaultTransfrom)
    }
  )
}

module.exports.resolve = resolve
