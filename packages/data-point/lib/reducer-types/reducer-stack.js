/**
 * @param {Error} error
 * @throws the given error
 */
function throwError (error) {
  throw error
}

module.exports.throwError = throwError

/**
 * @param {Array} stack
 * @return {Function}
 */
function getErrorHandler (stack) {
  /**
   * @param {Error} error
   * @param {Function} reject
   */
  return function onReducerError (error, reject = throwError) {
    if (!error.rstack) {
      error.rstack = stack
    }

    reject(error)
  }
}

module.exports.getErrorHandler = getErrorHandler

/**
 * @param {Array} path
 * @return {string}
 */
function stringifyReducerStack (path) {
  return path.reduce((acc, item) => {
    if (typeof item === 'number') {
      return `${acc}[${item}]`
    }

    if (Array.isArray(item)) {
      return `${acc}[${item.join('.')}]`
    }

    return acc ? `${acc} -> ${item}` : item
  }, '')
}

module.exports.stringifyReducerStack = stringifyReducerStack
