'use strict'

const middlewareContextFactory = require('../middleware-context')
const middlewareControl = require('../middleware-control')

function getStack (stack, middlewareName) {
  return stack.reduce((acc, middleware) => {
    if (middleware.name === middlewareName) {
      acc.push(middleware.callback)
    }
    return acc
  }, [])
}

module.exports.getStack = getStack

function executeStack (stack, middlewareName, accumulator) {
  const middlewareStack = getStack(stack, middlewareName)
  return middlewareControl(accumulator, middlewareStack)
}

module.exports.executeStack = executeStack

function resolve (manager, middlewareName, accumulator) {
  const middlewareContext = middlewareContextFactory.create(accumulator)
  return executeStack(
    manager.middleware.stack,
    middlewareName,
    middlewareContext
  )
}

module.exports.resolve = resolve
