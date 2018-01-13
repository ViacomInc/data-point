/**
 * @param {Array} stack
 * @param {*} value
 * @return {Function}
 */
function getErrorHandler (stack, value) {
  /**
   * @param {Error} error
   * @throws the error parameter
   */
  return function onReducerError (error) {
    if (!error.rstack) {
      error.rstack = stack
      error.rvalue = value
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
