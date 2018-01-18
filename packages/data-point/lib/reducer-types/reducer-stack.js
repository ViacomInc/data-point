/**
 * @param {Array} stack
 * @param {*} value
 * @param {Error} error
 * @throws the given error
 */
function onReducerError (stack, value, error) {
  if (stack && !error.rstack) {
    error.rstack = stack
    error.rvalue = value
  }

  throw error
}

module.exports.onReducerError = onReducerError

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
