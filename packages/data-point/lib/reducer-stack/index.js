function stackPush (stack, ...items) {
  return [...stack, ...items]
}

module.exports.stackPush = stackPush

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

/**
 * @param {Array} stack
 * @param {*} value
 * @param {Error} error
 * @param {string} header
 * @throws the given error with more properties added
 */
function onReducerError (stack, value, error, header = 'Value') {
  if (stack && !error.rstack) {
    error.rstack = stack
    error.rvalue = { header, value }
  }

  throw error
}

module.exports.onReducerError = onReducerError
