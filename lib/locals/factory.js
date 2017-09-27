'use strict'

const _ = require('lodash')

function Locals () {}

module.exports.Locals = Locals

/**
 * parses a raw transform
 * @param  {string} transformRaw raw value path to be parsed
 * @return {Locals}
 */
function create (spec) {
  const locals = new Locals()
  return _.assign(locals, spec)
}

module.exports.create = create
