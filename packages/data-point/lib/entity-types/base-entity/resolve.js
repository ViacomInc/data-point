'use strict'

const _ = require('lodash')
const Promise = require('bluebird')

const middleware = require('../../middleware')

const utils = require('../../utils')

function resolveErrorReducers (error, accumulator, resolveReducer) {
  const errorTransform = accumulator.reducer.spec.error

  if (errorTransform.reducers.length === 0) {
    return Promise.reject(error)
  }

  const errorAccumulator = utils.set(accumulator, 'value', error)

  const reducerResolved = resolveReducer(errorAccumulator, errorTransform)

  return reducerResolved.then(result =>
    utils.set(accumulator, 'value', result.value)
  )
}

module.exports.resolveErrorReducers = resolveErrorReducers

function createCurrentAccumulator (manager, accumulator, reducer) {
  // get defined source
  const entity = manager.entities.get(reducer.id)

  // set reducer's spec
  const currentReducer = utils.assign(reducer, {
    spec: entity,
    options: entity.options
  })

  // create accumulator to resolve
  const currentAccumulator = utils.assign(accumulator, {
    context: entity,
    reducer: currentReducer,
    initialValue: accumulator.value,
    // shortcut to reducer.spec.params
    params: entity.params
  })

  return currentAccumulator
}

module.exports.createCurrentAccumulator = createCurrentAccumulator

/**
 * Resolves a middeware, this method contains a 'hack'
 * which consists in using an error to bypass the
 * chain of promise then that come after it.
 *
 * If there is a better/faster more elegant way to do this
 * then pls let me know and send a PR
 *
 * @param {Object} manager - dataPoint instance
 * @param {string} name - name of middleware to execute
 * @param {Accumulator} acc - current accumulator
 */
function resolveMiddleware (manager, name, acc) {
  return middleware.resolve(manager, name, acc).then(middlewareResult => {
    const reqCtx = utils.assign(acc, {
      value: middlewareResult.value,
      locals: middlewareResult.locals
    })

    if (middlewareResult.___resolve === true) {
      // doing this until proven wrong :)
      const err = new Error('bypassing middleware')
      err.name = 'bypass'
      err.bypass = true
      err.bypassValue = reqCtx
      return Promise.reject(err)
    }

    return reqCtx
  })
}
module.exports.resolveMiddleware = resolveMiddleware

function resolveEntity (
  manager,
  resolveTransform,
  accumulator,
  reducer,
  mainResolver
) {
  const currentAccumulator = createCurrentAccumulator(
    manager,
    accumulator,
    reducer
  )

  const trace =
    currentAccumulator.trace === true ||
    currentAccumulator.reducer.spec.params.trace === true

  let accUid = currentAccumulator
  let timeId
  if (trace === true) {
    accUid = utils.set(currentAccumulator, 'euid', utils.getUID())
    timeId = `⧖ ${accUid.context.id}(${accUid.euid})`
    console.time(timeId)
  }
  return Promise.resolve(accUid)
    .then(acc => resolveMiddleware(manager, `before`, acc))
    .then(acc =>
      resolveMiddleware(manager, `${reducer.entityType}:before`, acc)
    )
    .then(acc => resolveTransform(acc, acc.reducer.spec.before))
    .then(acc => mainResolver(acc, resolveTransform))
    .then(acc => resolveTransform(acc, acc.reducer.spec.after))
    .then(acc =>
      middleware.resolve(manager, `${reducer.entityType}:after`, acc)
    )
    .then(acc => resolveMiddleware(manager, `after`, acc))
    .catch(error => {
      // checking if this is an error to bypass the `then` chain
      if (error.bypass === true) {
        return error.bypassValue
      }
      // attach entity information to help debug
      error.entityId = currentAccumulator.reducer.spec.id

      return resolveErrorReducers(error, currentAccumulator, resolveTransform)
    })
    .then(resultContext => {
      if (trace === true) {
        console.timeEnd(timeId)
      }

      // clean up any modifications we have done to the result context and pass
      // a copy of the original accumulator with only `value` modified
      return utils.set(accumulator, 'value', resultContext.value)
    })
}

module.exports.resolveEntity = resolveEntity

function resolve (manager, resolveReducer, accumulator, reducer, mainResolver) {
  const hasEmptyConditional = reducer.hasEmptyConditional

  if (hasEmptyConditional && utils.isFalsy(accumulator.value)) {
    return Promise.resolve(accumulator)
  }

  const resolveTransform = _.partial(resolveReducer, manager)

  const shouldMapCollection =
    reducer.asCollection && accumulator.value instanceof Array

  if (!shouldMapCollection) {
    return resolveEntity(
      manager,
      resolveTransform,
      accumulator,
      reducer,
      mainResolver
    )
  }

  return Promise.map(accumulator.value, itemValue => {
    const itemCtx = utils.set(accumulator, 'value', itemValue)

    if (hasEmptyConditional && utils.isFalsy(itemValue)) {
      return Promise.resolve(itemCtx)
    }

    return resolveEntity(
      manager,
      resolveTransform,
      itemCtx,
      reducer,
      mainResolver
    )
  }).then(mappedResults => {
    const value = mappedResults.map(acc => acc.value)
    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
