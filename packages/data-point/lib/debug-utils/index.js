/**
 * @param {Array} stack
 * @return {String}
 */
function stringifyReducerStack (stack) {
  const message = stack.reduce((acc, id) => {
    if (typeof id === 'number') {
      return `${acc}[${id}]`
    }

    if (Array.isArray(id)) {
      return `${acc}[${id.join('.')}]`
    }

    return acc ? `${acc} -> ${id}` : id
  }, '')

  return message
}

module.exports.stringifyReducerStack = stringifyReducerStack
