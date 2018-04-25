const Promise = require('bluebird')

const middleware = require('../../middleware')

const utils = require('../../utils')

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
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @returns {Accumulator}
 */
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

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Function} mainResolver
 * @returns {Promise<Accumulator>}
 */
function resolveEntity (
  manager,
  resolveReducer,
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

  let timeId
  let accUid = currentAccumulator
  if (trace === true) {
    accUid = utils.set(currentAccumulator, 'euid', utils.getUID())
    timeId = `⧖ ${accUid.context.id}(${accUid.euid})`
    console.time(timeId)
  }

  const {
    inputType,
    before,
    after,
    outputType
  } = currentAccumulator.reducer.spec

  let result = Promise.resolve(accUid)

  if (inputType) {
    result = result.then(acc => {
      return typeCheck(manager, acc, inputType, resolveReducer)
    })
  }

  result = resolveMiddleware(manager, result, 'before')

  result = resolveMiddleware(manager, result, `${reducer.entityType}:before`)

  if (before) {
    result = result.then(acc => {
      return resolveReducer(manager, acc, before)
    })
  }

  result = result.then(acc => {
    return mainResolver(acc, resolveReducer.bind(null, manager))
  })

  if (after) {
    result = result.then(acc => {
      return resolveReducer(manager, acc, after)
    })
  }

  result = resolveMiddleware(manager, result, `${reducer.entityType}:after`)

  result = resolveMiddleware(manager, result, 'after')

  result = result.catch(error => {
    // checking if this is an error to bypass the `then` chain
    if (error.bypass === true) {
      return error.bypassValue
    }

    throw error
  })

  if (outputType) {
    result = result.then(acc => {
      return typeCheck(manager, acc, outputType, resolveReducer)
    })
  }

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

      if (outputType) {
        errorResult = errorResult.then(acc => {
          return typeCheck(manager, acc, outputType, resolveReducer)
        })
      }

      return errorResult
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

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Function} mainResolver
 * @returns {Promise<Accumulator>}
 */
function resolve (manager, resolveReducer, accumulator, reducer, mainResolver) {
  const hasEmptyConditional = reducer.hasEmptyConditional

  if (hasEmptyConditional && utils.isFalsy(accumulator.value)) {
    return Promise.resolve(accumulator)
  }

  if (!reducer.asCollection) {
    return resolveEntity(
      manager,
      resolveReducer,
      accumulator,
      reducer,
      mainResolver
    )
  }

  if (!Array.isArray(accumulator.value)) {
    return Promise.resolve(utils.set(accumulator, 'value', undefined))
  }

  return Promise.map(accumulator.value, itemValue => {
    const itemCtx = utils.set(accumulator, 'value', itemValue)

    if (hasEmptyConditional && utils.isFalsy(itemValue)) {
      return Promise.resolve(itemCtx)
    }

    return resolveEntity(
      manager,
      resolveReducer,
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
