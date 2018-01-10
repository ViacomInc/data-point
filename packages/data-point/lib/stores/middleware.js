
const _ = require('lodash')
const middlewareFactory = require('../middleware')

function clear (manager) {
  /* eslint no-param-reassign: "off" */
  manager.stack = []
  return manager
}
module.exports.clear = clear

function use (manager, name, callback) {
  manager.stack.push(middlewareFactory.create(name, callback))
  return manager.stack
}

module.exports.use = use

function create (spec) {
  const manager = {
    stack: []
  }

  manager.use = _.partial(use, manager)
  manager.clear = _.partial(clear, manager)

  return manager
}

module.exports.create = create
