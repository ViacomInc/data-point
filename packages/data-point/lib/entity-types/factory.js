// TODO add precompile flag?

/**
 * @param {String} type
 * @return {Function}
 */
function createEntityFactory (type) {
  /**
   * @param {String} name
   * @param {Object} spec
   * @return {Object}
   */
  return function Factory (name, spec) {
    const id = `${type}:${name}`
    return {
      id,
      type,
      name,
      spec,
      definition: { [id]: spec }
    }
  }
}

module.exports.createEntityFactory = createEntityFactory
