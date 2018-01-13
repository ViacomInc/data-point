/**
 * @param {Array} stack
 * @return {Function}
 */
function getErrorHandler (stack) {
  /**
   * @param {Error} error
   * @throws the error parameter
   */
  return function onReducerError (error) {
    if (!error.rstack) {
      error.rstack = stack
    }

    throw error
  }
}

module.exports.getErrorHandler = getErrorHandler

/**
 * @param {Array} stack
 * @return {string}
 */
function stringifyReducerStack (stack) {
  return stack.reduce((acc, item) => {
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
