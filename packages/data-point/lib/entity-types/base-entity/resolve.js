const _ = require('lodash')
const Promise = require('bluebird')

const middleware = require('../../middleware')

const utils = require('../../utils')

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
    errorReducer,
    [['error']]
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

/**
 * @param {Object} manager
 * @param {Accumulator} accumulator
 * @param {Reducer} reducer
 * @param {Function} resolveReducer
 * @param {Array} key
 * @return {Promise}
 */
function typeCheck (manager, accumulator, reducer, resolveReducer, key) {
  // returns original accumulator if there's no error
  // this helps prevent type check reducers from mutating the value, but
  // it's still possible to modify the value by reference when it's an object
  return resolveReducer(manager, accumulator, reducer, key).return(accumulator)
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

  let accUid = currentAccumulator
  let timeId
  if (trace === true) {
    accUid = utils.set(currentAccumulator, 'euid', utils.getUID())
    timeId = `⧖ ${accUid.context.id}(${accUid.euid})`
    console.time(timeId)
  }

  const resolveReducerBound = _.partial(resolveReducer, manager)

  return Promise.resolve(accUid)
    .then(acc => {
      const reducer = acc.reducer.spec.inputType
      return typeCheck(manager, acc, reducer, resolveReducer, [['inputType']])
    })
    .then(acc => {
      return resolveMiddleware(manager, 'before', acc)
    })
    .then(acc => {
      return resolveMiddleware(manager, `${reducer.entityType}:before`, acc)
    })
    .then(acc => {
      const reducer = acc.reducer.spec.before
      return resolveReducer(manager, acc, reducer, [['before']])
    })
    .then(acc => {
      return mainResolver(acc, resolveReducerBound)
    })
    .then(acc => {
      const reducer = acc.reducer.spec.after
      return resolveReducer(manager, acc, reducer, [['after']])
    })
    .then(acc => {
      return resolveMiddleware(manager, `${reducer.entityType}:after`, acc)
    })
    .then(acc => {
      return resolveMiddleware(manager, 'after', acc)
    })
    .catch(error => {
      // checking if this is an error to bypass the `then` chain
      if (error.bypass === true) {
        return error.bypassValue
      }

      throw error
    })
    .then(acc => {
      const reducer = acc.reducer.spec.outputType
      return typeCheck(manager, acc, reducer, resolveReducer, [['outputType']])
    })
    .catch(error => {
      // attach entity information to help debug
      error.entityId = currentAccumulator.reducer.spec.id

      return resolveErrorReducers(
        manager,
        error,
        currentAccumulator,
        resolveReducer
      ).then(acc => {
        const reducer = acc.reducer.spec.outputType
        return typeCheck(manager, acc, reducer, resolveReducer, [
          ['outputType']
        ])
      })
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
