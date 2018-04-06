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

  manager.use = use.bind(null, manager)
  manager.clear = clear.bind(null, manager)

  return manager
}

module.exports.create = create
