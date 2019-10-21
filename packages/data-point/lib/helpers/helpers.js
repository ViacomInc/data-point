const _ = require("lodash");
const util = require("util");
const resolveReducer = require("../reducer-types").resolve;
const AccumulatorFactory = require("../accumulator/factory");

const { stubFactories } = require("../reducer-types/reducer-helpers");

module.exports.helpers = {
  assign: stubFactories.assign,
  constant: stubFactories.constant,
  filter: stubFactories.filter,
  find: stubFactories.find,
  map: stubFactories.map,
  omit: stubFactories.omit,
  parallel: stubFactories.parallel,
  pick: stubFactories.pick,
  withDefault: stubFactories.withDefault
};

module.exports.entityFactories = require("../entity-types").factories;

module.exports.isReducer = require("../reducer-types").isReducer;

module.exports.createReducer = require("../reducer-types").create;

module.exports.createEntity = require("../entity-types/base-entity").create;

module.exports.resolveEntity = require("../entity-types/base-entity/resolve").resolve;

module.exports.validateEntityModifiers = require("../entity-types/validate-modifiers").validateModifiers;

function reducify(method) {
  return (...args) => {
    const partialArguments = Array.prototype.slice.call(args);
    return value => {
      const methodArguments = [value].concat(partialArguments);
      return method(...methodArguments);
    };
  };
}

module.exports.reducify = reducify;

function reducifyAll(source, methodList) {
  let target = source;
  if (!_.isEmpty(methodList)) {
    target = _.pick(source, methodList);
  }
  return _.mapValues(target, reducify);
}

module.exports.reducifyAll = reducifyAll;

async function mockReducer(reducer, acc) {
  const pcb = util.promisify(reducer);
  const value = await pcb(acc.value, acc);
  return { value };
}

module.exports.mockReducer = mockReducer;

function createAccumulator(value, options) {
  return AccumulatorFactory.create(
    Object.assign(
      {
        value
      },
      options
    )
  );
}

module.exports.createAccumulator = createAccumulator;

function createReducerResolver(dataPoint) {
  return resolveReducer.bind(null, dataPoint);
}

module.exports.createReducerResolver = createReducerResolver;
