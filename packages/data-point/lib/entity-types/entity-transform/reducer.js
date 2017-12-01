'use strict'

function resolve (accumulator, resolveTransform) {
  const entity = accumulator.reducer.spec
  return resolveTransform(accumulator, entity.value)
}

module.exports.resolve = resolve
