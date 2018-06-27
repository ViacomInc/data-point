const debug = require('debug')
const Promise = require('bluebird')
const middleware = require('../../middleware')
const utils = require('../../utils')
const memoize = require('lodash/memoize')
const merge = require('lodash/merge')

/**
 * create a new debug scope
 * @param {String} entityType debug scope
 */
function createDebugEntity (entityType) {
  return debug(`data-point:entity:${entityType}`)
}

// debug scope gets memoized so it is not as expensive, it will only create one
// per entity type
const debugEntity = memoize(createDebugEntity)

/**
 * @param {Object} manager
 * @param {Error} error
 * @param {Accumulator} accumulator
 * @param {Function} resolveReducer
 * @returns {Promise<Accumulator>}
 */
function resolveErrorReducers (manager, error, accumulator, resolveReducer) {
  const errorReducer = accumulator.reducer.spec.error
  if (!errorReducer) {
    return Promise.reject(error)
  }

  const errorAccumulator = utils.set(accumulator, 'value', error)

  const reducerResolved = resolveReducer(
    manager,
    errorAccumulator,
    errorReducer
  )

  return reducerResolved.then(result =>
    utils.set(accumulator, 'value', result.value)
  )
}

module.exports.resolveErrorReducers = resolveErrorReducers

/**
 * @param {Promise} promise
 * @param {*} condition
 * @param {Function} callback
 * @returns {Promise}
 */
function addToPromiseChain (promise, condition, callback) {
  if (!condition) {
    return promise
  }

  return promise.then(callback)
}

/**
 * @param {Error} error
 * @returns {*} bypass value
 * @throws rethrows error if bypass was not found
 */
function handleByPassError (error) {
  // checking if this is an error to bypass the `then` chain
  if (error.bypass === true) {
    return error.bypassValue
  }

  throw error
}

/**
 * @param {Reducer} reducer
 * @param {Object} entity
 */
function getCurrentReducer (reducer, entity) {
  if (!reducer.spec) {
    return utils.assign(reducer, {
      spec: entity
    })
  }

  return reducer
}

module.exports.getCurrentReducer = getCurrentReducer

/**
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @param {Object} entity
 * @returns {Accumulator}
 */
function createCurrentAccumulator (accumulator, reducer, entity) {
  const currentReducer = getCurrentReducer(reducer, entity)
  const entityId = reducer.id
  const uid = `${entityId}:${utils.getUID()}`

  // create accumulator to resolve
  const currentAccumulator = utils.assign(accumulator, {
    uid: uid,
    context: entity,
    reducer: currentReducer,
    initialValue: accumulator.value,
    params: assignParamsHelper(accumulator, entity),
    debug: debugEntity(reducer.entityType)
  })

  return currentAccumulator
}

module.exports.createCurrentAccumulator = createCurrentAccumulator

/**
 * Incase there is an override present, assigns parameters to the correct entity.
 * @param {*} accumulator
 * @param {*} entity
 */
function assignParamsHelper (accumulator, entity) {
  if (accumulator.entityOverrides[entity.entityType]) {
    return merge(
      {},
      entity.params,
      accumulator.entityOverrides[entity.entityType].params
    )
  }
  return entity.params
}

module.exports.assignParamsHelper = assignParamsHelper

/**
 * Resolves a middeware, this method contains a 'hack'
 * which consists in using an error to bypass the
 * chain of promise then that come after it.
 *
 * If there is a better/faster more elegant way to do this
 * then pls let me know and send a PR
 *
 * @param {Object} manager - dataPoint instance
 * @param {Promise} promise - should resolve to the current accumulator
 * @param {string} name - name of middleware to execute
 * @returns {Promise}
 */
function resolveMiddleware (manager, promise, name) {
  if (!manager.middleware.store.has(name)) {
    return promise
  }

  return promise
    .then(accumulator => {
      return middleware.resolve(manager, name, accumulator)
    })
    .then(middlewareResult => {
      if (middlewareResult.___resolve === true) {
        middlewareResult.debug(middlewareResult.uid, '- will bypass')
        // doing this until proven wrong :)
        const err = new Error('bypassing middleware')
        err.name = 'bypass'
        err.bypass = true
        err.bypassValue = middlewareResult
        throw err
      }

      return middlewareResult
    })
}

module.exports.resolveMiddleware = resolveMiddleware

/**
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @param {Function} resolveReducer
 * @returns {Promise}
 */
function typeCheck (manager, accumulator, reducer, resolveReducer) {
  // returns original accumulator if there's no error
  // this helps prevent type check reducers from mutating the value, but
  // it's still possible to modify the value by reference when it's an object
  return resolveReducer(manager, accumulator, reducer).return(accumulator)
}

module.exports.typeCheck = typeCheck
/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Object} entity
 * @returns {Promise<Accumulator>}
 */
function resolveEntity (manager, resolveReducer, accumulator, reducer, entity) {
  const currentAccumulator = createCurrentAccumulator(
    accumulator,
    reducer,
    entity
  )

  const {
    inputType,
    value,
    before,
    after,
    outputType
  } = currentAccumulator.reducer.spec

  const trace =
    currentAccumulator.trace === true ||
    currentAccumulator.context.params.trace === true

  let timeId
  if (trace === true) {
    timeId = `⧖ ${currentAccumulator.uid}`
    console.time(timeId)
  }

  currentAccumulator.debug(currentAccumulator.uid, '- resolve:start')

  let result = Promise.resolve(currentAccumulator)

  result = addToPromiseChain(result, inputType, acc =>
    typeCheck(manager, acc, inputType, resolveReducer)
  )

  result = resolveMiddleware(manager, result, 'before')

  result = resolveMiddleware(manager, result, `${reducer.entityType}:before`)

  result = addToPromiseChain(result, before, acc =>
    resolveReducer(manager, acc, before)
  )

  result = addToPromiseChain(result, value, acc =>
    resolveReducer(manager, acc, value)
  )

  result = result.then(acc => {
    acc.debug(acc.uid, '- resolve')
    return entity.resolve(acc, resolveReducer.bind(null, manager))
  })

  result = addToPromiseChain(result, after, acc =>
    resolveReducer(manager, acc, after)
  )

  result = resolveMiddleware(manager, result, `${reducer.entityType}:after`)

  result = resolveMiddleware(manager, result, 'after')

  result = result.catch(handleByPassError)

  result = addToPromiseChain(result, outputType, acc =>
    typeCheck(manager, acc, outputType, resolveReducer)
  )

  return result
    .catch(error => {
      // attach entity information to help debug
      error.entityId = currentAccumulator.reducer.spec.id

      let errorResult = resolveErrorReducers(
        manager,
        error,
        currentAccumulator,
        resolveReducer
      )

      errorResult = addToPromiseChain(errorResult, outputType, acc =>
        typeCheck(manager, acc, outputType, resolveReducer)
      )

      return errorResult
    })
    .then(resultContext => {
      if (trace === true) {
        console.timeEnd(timeId)
      }

      resultContext.debug(resultContext.uid, `- resolve:end`)

      // clean up any modifications we have done to the result context and pass
      // a copy of the original accumulator with only `value` modified
      return utils.set(accumulator, 'value', resultContext.value)
    })
}

module.exports.resolveEntity = resolveEntity

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Object} entity
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, entity) {
  const hasEmptyConditional = reducer.hasEmptyConditional

  if (hasEmptyConditional && utils.isFalsy(accumulator.value)) {
    return Promise.resolve(accumulator)
  }

  if (!reducer.asCollection) {
    return resolveEntity(manager, resolveReducer, accumulator, reducer, entity)
  }

  if (!Array.isArray(accumulator.value)) {
    return Promise.resolve(utils.set(accumulator, 'value', undefined))
  }

  return Promise.map(accumulator.value, itemValue => {
    const itemCtx = utils.set(accumulator, 'value', itemValue)

    if (hasEmptyConditional && utils.isFalsy(itemValue)) {
      return Promise.resolve(itemCtx)
    }

    return resolveEntity(manager, resolveReducer, itemCtx, reducer, entity)
  }).then(mappedResults => {
    const value = mappedResults.map(acc => acc.value)
    return utils.set(accumulator, 'value', value)
  })
}

module.exports.resolve = resolve
