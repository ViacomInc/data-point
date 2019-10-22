const _ = require("lodash");

const Reducer = require("../reducer-types");
const AccumulatorFactory = require("../accumulator/factory");
const Trace = require("../trace");
const utils = require("../utils");

function getOptions(spec) {
  return _.defaults({}, spec, {
    locals: {},
    entityOverrides: {}
  });
}

/**
 * @param {DataPoint} manager DataPoint instance
 * @param {Object} reducerSource reducer source
 * @param {Accumulator} context accumulator object
 * @returns {Promise<Accumulator>} resolved reducer context
 */
function resolveFromAccumulator(manager, reducerSource, context) {
  const reducer = Reducer.create(reducerSource);
  return Reducer.resolve(manager, context, reducer);
}

module.exports.resolveFromAccumulator = resolveFromAccumulator;

async function reducerResolve(manager, reducerSource, value, options) {
  const contextOptions = getOptions(options);
  const context = AccumulatorFactory.create({
    value,
    locals: contextOptions.locals,
    entityOverrides: contextOptions.entityOverrides,
    trace: contextOptions.trace,
    values: manager.values.getStore()
  });

  const resolvedValue = await resolveFromAccumulator(
    manager,
    reducerSource,
    context
  );

  const resolvedContext = utils.set(context, "value", resolvedValue);

  return !context.trace ? resolvedContext : Trace.traceReducer(resolvedContext);
}

async function transform(manager, reducerSource, value, options, done) {
  let acc;
  try {
    acc = await reducerResolve(manager, reducerSource, value, options);
    if (done) {
      done(null, acc);
      return undefined;
    }
  } catch (error) {
    if (done) {
      done(error);
    } else {
      throw error;
    }
  }

  return acc;
}

module.exports.transform = transform;

async function resolve(manager, reducerSource, value, options) {
  const acc = await reducerResolve(manager, reducerSource, value, options);
  return acc.value;
}

module.exports.resolve = _.curry(resolve, 3);
