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
 * @returns {Promise}
 */
function resolveErrorReducers (manager, error, accumulator, resolveReducer) {
  const errorReducer = accumulator.reducer.spec.error
  if (!errorReducer) {
    return Promise.reject(error)
  }

  const errorAccumulator = utils.set(accumulator, 'value', error)
  return resolveReducer(manager, errorAccumulator, errorReducer)
}

module.exports.resolveErrorReducers = resolveErrorReducers

/**
 * @param {Promise} promise
 * @param {*} condition
 * @param {Accumulator} accumulator
 * @param {Function} callback
 * @returns {Promise}
 */
function addToPromiseChain (promise, condition, accumulator, callback) {
  if (!condition) {
    return promise
  }

  return promise.then(result => {
    return callback(utils.set(accumulator, 'value', result))
  })
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
 * Resolves a middleware, this method contains a 'hack'
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
function resolveMiddleware (manager, accumulator, name) {
  return middleware
    .resolve(manager, name, accumulator)
    .then(middlewareResult => {
      if (middlewareResult.___resolve === true) {
        accumulator.debug(accumulator.uid, '- will bypass')
        // doing this until proven wrong :)
        const err = new Error('bypassing middleware')
        err.name = 'bypass'
        err.bypass = true
        err.bypassValue = middlewareResult.value
        throw err
      }

      return middlewareResult.value
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
  return resolveReducer(manager, accumulator, reducer).return(accumulator.value)
}

module.exports.typeCheck = typeCheck
/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Object} entity
 * @returns {Promise}
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

  const trace = currentAccumulator.context.params.trace === true

  let timeId
  if (trace === true) {
    timeId = `⧖ ${currentAccumulator.uid}`
    console.time(timeId)
  }

  currentAccumulator.debug(currentAccumulator.uid, '- resolve:start')

  let result = Promise.resolve(currentAccumulator.value)

  result = addToPromiseChain(result, inputType, currentAccumulator, acc =>
    typeCheck(manager, acc, inputType, resolveReducer)
  )

  result = addToPromiseChain(
    result,
    manager.middleware.store.has('before'),
    currentAccumulator,
    acc => resolveMiddleware(manager, acc, 'before')
  )

  const middlewareEntityBefore = `${reducer.entityType}:before`
  result = addToPromiseChain(
    result,
    manager.middleware.store.has(middlewareEntityBefore),
    currentAccumulator,
    acc => resolveMiddleware(manager, acc, middlewareEntityBefore)
  )

  result = addToPromiseChain(result, before, currentAccumulator, acc =>
    resolveReducer(manager, acc, before)
  )

  result = addToPromiseChain(result, value, currentAccumulator, acc =>
    resolveReducer(manager, acc, value)
  )

  result = result.then(result => {
    currentAccumulator.debug(currentAccumulator.uid, '- resolve')
    const acc = utils.set(currentAccumulator, 'value', result)
    return entity.resolve(acc, resolveReducer.bind(null, manager))
  })

  result = addToPromiseChain(result, after, currentAccumulator, acc =>
    resolveReducer(manager, acc, after)
  )

  const middlewareEntityAfter = `${reducer.entityType}:after`
  result = addToPromiseChain(
    result,
    manager.middleware.store.has(middlewareEntityAfter),
    currentAccumulator,
    acc => resolveMiddleware(manager, acc, middlewareEntityAfter)
  )

  result = addToPromiseChain(
    result,
    manager.middleware.store.has('after'),
    currentAccumulator,
    acc => resolveMiddleware(manager, acc, 'after')
  )

  result = result.catch(handleByPassError)

  result = addToPromiseChain(result, outputType, currentAccumulator, acc =>
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

      errorResult = addToPromiseChain(
        errorResult,
        outputType,
        currentAccumulator,
        acc => typeCheck(manager, acc, outputType, resolveReducer)
      )

      return errorResult
    })
    .then(value => {
      if (trace === true) {
        console.timeEnd(timeId)
      }

      currentAccumulator.debug(currentAccumulator.uid, `- resolve:end`)

      return value
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
    return Promise.resolve(accumulator.value)
  }

  if (!reducer.asCollection) {
    return resolveEntity(manager, resolveReducer, accumulator, reducer, entity)
  }

  if (!Array.isArray(accumulator.value)) {
    return Promise.resolve(undefined)
  }

  return Promise.map(accumulator.value, itemValue => {
    if (hasEmptyConditional && utils.isFalsy(itemValue)) {
      return itemValue
    }

    const itemCtx = utils.set(accumulator, 'value', itemValue)
    return resolveEntity(manager, resolveReducer, itemCtx, reducer, entity)
  })
}

module.exports.resolve = resolve
