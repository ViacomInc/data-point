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
  return resolveReducer(manager, errorAccumulator, errorReducer)
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
    if (middlewareResult.___resolve === true) {
      // doing this until proven wrong :)
      const err = new Error('bypassing middleware')
      err.name = 'bypass'
      err.bypass = true
      err.bypassValue = middlewareResult.value
      return Promise.reject(err)
    }

    return middlewareResult.value
  })
}

module.exports.resolveMiddleware = resolveMiddleware

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Function} mainResolver
 * @returns {Promise}
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

  const resolveReducerBound = resolveReducer.bind(null, manager)

  return Promise.resolve(accUid)
    .tap(acc => {
      return resolveReducer(manager, acc, acc.reducer.spec.inputType)
    })
    .then(acc => {
      return resolveMiddleware(manager, `before`, acc)
    })
    .then(value => {
      const acc = utils.set(accUid, 'value', value)
      return resolveMiddleware(manager, `${reducer.entityType}:before`, acc)
    })
    .then(value => {
      const acc = utils.set(accUid, 'value', value)
      return resolveReducer(manager, acc, acc.reducer.spec.before)
    })
    .then(value => {
      const acc = utils.set(accUid, 'value', value)
      return mainResolver(acc, resolveReducerBound)
    })
    .then(value => {
      const acc = utils.set(accUid, 'value', value)
      return resolveReducer(manager, acc, acc.reducer.spec.after)
    })
    .then(value => {
      const acc = utils.set(accUid, 'value', value)
      return resolveMiddleware(manager, `${reducer.entityType}:after`, acc)
    })
    .then(value => {
      const acc = utils.set(accUid, 'value', value)
      return resolveMiddleware(manager, `after`, acc)
    })
    .catch(error => {
      // checking if this is an error to bypass the `then` chain
      if (error.bypass === true) {
        return error.bypassValue
      }

      throw error
    })
    .tap(value => {
      const acc = utils.set(accUid, 'value', value)
      return resolveReducer(manager, acc, acc.reducer.spec.outputType)
    })
    .catch(error => {
      // attach entity information to help debug
      error.entityId = accUid.reducer.spec.id

      return resolveErrorReducers(manager, error, accUid, resolveReducer).tap(
        value => {
          const acc = utils.set(accUid, 'value', value)
          return resolveReducer(manager, acc, acc.reducer.spec.outputType)
        }
      )
    })
    .then(value => {
      if (trace === true) {
        console.timeEnd(timeId)
      }

      return value
    })
}

module.exports.resolveEntity = resolveEntity

/**
 * @param {Object} manager
 * @param {Function} resolveReducer
 * @param {Accumulator} accumulator
 * @param {Function} reducer
 * @param {Function} mainResolver
 * @returns {Promise}
 */
function resolve (manager, resolveReducer, accumulator, reducer, mainResolver) {
  const hasEmptyConditional = reducer.hasEmptyConditional

  if (hasEmptyConditional && utils.isFalsy(accumulator.value)) {
    return Promise.resolve(accumulator.value)
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
    return Promise.resolve(undefined)
  }

  return Promise.map(accumulator.value, itemValue => {
    const itemCtx = utils.set(accumulator, 'value', itemValue)

    if (hasEmptyConditional && utils.isFalsy(itemValue)) {
      return itemValue
    }

    return resolveEntity(
      manager,
      resolveReducer,
      itemCtx,
      reducer,
      mainResolver
    )
  })
}

module.exports.resolve = resolve
