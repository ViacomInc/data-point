const merge = require('lodash/merge')

/**
 * @class
 */
function Accumulator () {
  this.value = undefined
  this.locals = undefined
  this.values = undefined
  this.reducer = undefined
  this.trace = false
  this.context = undefined
}

module.exports.Accumulator = Accumulator

/**
 * creates new Accumulator based on spec
 * @param  {Object} spec - acumulator spec
 * @return {Source}
 */
function create (spec) {
  const accumulator = new Accumulator()

  accumulator.value = spec.value
  accumulator.context = spec.context
  accumulator.reducer = {
    spec: spec.context
  }

  accumulator.locals = merge({}, spec.locals)
  accumulator.values = spec.values
  accumulator.trace = spec.trace

  return Object.freeze(accumulator)
}

module.exports.create = create
