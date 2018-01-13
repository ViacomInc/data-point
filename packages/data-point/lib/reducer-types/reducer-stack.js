/**
 * @param {Array} stack
 * @return {Function}
 */
function getErrorHandler (stack) {
  return function onReducerError (error, reject) {
    if (!error.rstack) {
      error.rstack = stack
    }

    if (reject) {
      return reject(error)
    }

    throw error
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
