
const coreFactory = require('../../lib/core')

const entitiesDefinitions = require('../definitions/entities')

/**
 * create dataPoint store instance
 * @return {Object}
 */
function create (options) {
  const instance = coreFactory.create(options)
  instance.addValue('server', 'http://remote.test')
  instance.addValue('val2', 2)
  instance.addEntities(entitiesDefinitions)
  return instance
}

module.exports.create = create
