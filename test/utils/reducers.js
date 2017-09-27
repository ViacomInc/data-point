'use strict'

const _ = require('lodash')

const utils = require('../../lib/utils')

module.exports.passThrough = () => (context, next) => {
  next(null, context.value)
}

module.exports.throwError = () => (context, next) => {
  throw new Error('unexpected')
}

// invalid in return type (should return function)
module.exports.invalidReducer = () => {
  // should had return a function
}

// invalid in arity, must be 2
module.exports.invalidReducerArity = () => context => {
  // return method should have context and callback as arguments
}

module.exports.isEqualTo = value => (context, next) => {
  next(null, context.value === value)
}

module.exports.addKeyValue = (key, val) => (context, next) => {
  const value = _.set(context.value, key, val)
  next(null, value)
}

module.exports.getKeyValue = key => (context, next) => {
  const value = _.get(context.value, key)
  next(null, value)
}

module.exports.addCollectionValues = () => (context, next) => {
  const value = context.value.reduce(_.add)
  next(null, value)
}

module.exports.timesArg1 = module.exports.multiplyBy = factor => (
  context,
  next
) => {
  next(null, context.value * factor)
}

module.exports.addString = string => (context, next) => {
  next(null, context.value + string)
}

module.exports.useDataContext = () => (context, next) => {
  next(null, context.value + context.initialValue.itemPath)
}

module.exports.addQueryVar = (key, val) => (context, next) => {
  const initialValue = context.value
  const value = utils.set(initialValue, `qs.${key}`, val)
  next(null, value)
}

module.exports.fromMetaToData = key => (context, next) => {
  const initialValue = context.value
  const value = _.get(context, `params.${key}`)
  const result = utils.set(initialValue, key, value)
  next(null, result)
}

module.exports.addStringFromMeta = key => (context, next) => {
  const value = _.get(context, `params.${key}`)
  const result = context.value + value
  next(null, result)
}

module.exports.setDataFromRequest = key => (context, next) => {
  const initialValue = context.value
  const value = _.get(context, `locals.${key}`)
  const result = utils.set(initialValue, key, value)
  next(null, result)
}

module.exports.addStringFromRequest = key => (context, next) => {
  const value = _.get(context, `locals.${key}`)
  const result = context.value + value
  next(null, result)
}

module.exports.sourceErrorDoNothing = () => (context, next) => {
  next(context.value)
}

module.exports.sourceErrorGraceful = () => (context, next) => {
  next(null, {
    noData: true
  })
}

module.exports.addStringFromContextKey = key => (context, next) => {
  const value = _.get(context, key)
  const result = context.value + value
  next(null, result)
}
