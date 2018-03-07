const capitalize = require('lodash/capitalize')

/**
 * @param {String} _type
 * @return {Function}
 */
function createEntityFactory (_type) {
  const type = _type.toLowerCase()
  /**
   * @param {String} name
   * @param {Object} spec
   * @return {Object}
   */
  function Factory (name, spec) {
    const id = `${type}:${name}`
    const result = { [id]: spec }
    // these properties are non-enumerable
    // so that we can do nifty things like:
    // dataPoint.create({ entities: { ...Hash('name', spec) } })
    Object.defineProperty(result, 'id', { value: id })
    Object.defineProperty(result, 'type', { value: type })
    Object.defineProperty(result, 'name', { value: name })
    Object.defineProperty(result, 'spec', { value: spec })
    return result
  }

  Object.defineProperty(Factory, 'name', {
    value: `${capitalize(type)}Factory`
  })

  Object.defineProperty(Factory, 'type', {
    value: type
  })

  return Factory
}

module.exports.createEntityFactory = createEntityFactory
